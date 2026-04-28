'use client';

import {
  AlertCircle,
  Archive,
  File,
  FileText,
  FileVideo,
  ImageIcon,
  Music,
  Upload,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label as ShadCNLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils/styles';

/** Existing attachment from your API (edit mode) — not a browser `File`, only a URL + metadata. */
export type FileUploadFieldRemoteFile = {
  /** Optional stable id for keys and remove handlers. */
  id?: string;
  /** Public URL (storage, CDN, signed URL). */
  url: string;
  /** Original filename for the list row. */
  name: string;
  mimeType?: string;
  /** When the API returns size (bytes). */
  sizeBytes?: number;
};

type FileUploadFieldSharedProps = {
  /** Field label above the control. */
  label?: string;
  /** Validation or helper error (takes precedence over client-side file messages). */
  error?: string;
  /** Marks the field as required in the label. */
  required?: boolean;
  disabled?: boolean;
  /** Native `accept` attribute (e.g. `image/*`, `.pdf`). */
  accept?: string;
  /** Optional hint under the label (not the error row). */
  description?: string;
  id?: string;
  /** Name for the file input in native forms. */
  name?: string;
  className?: string;
  /** Max size per file in bytes; oversize files are rejected with a short message. */
  maxFileSize?: number;
  /** Called when the user’s local file selection changes (replaces previous selection unless `multiple`). */
  onFilesChange?: (files: File[]) => void;
  /**
   * Existing files already stored on the server (edit mode). Shown with the same previews as local files.
   * Pass URLs from your API; removing an item calls `onExistingFilesChange` with the remaining list.
   */
  existingFiles?: FileUploadFieldRemoteFile[];
  /** Called when the user removes a remote attachment (update your form state / mark for deletion on save). */
  onExistingFilesChange?: (files: FileUploadFieldRemoteFile[]) => void;
  /**
   * Pre-populate the local file list on mount (e.g. to restore a picked file after navigating
   * between wizard steps). Only used as the initial value — subsequent changes are driven by the user.
   */
  initialFiles?: File[];
};

export type FileUploadFieldDefaultProps = FileUploadFieldSharedProps & {
  /** Row / drop-zone layout (default). */
  variant?: 'default';
  /** Allow more than one file. */
  multiple?: boolean;
  /** Max number of files when `multiple` is true (counts local + remote). */
  maxFiles?: number;
  /** Copy inside the drop zone when empty. */
  emptyHint?: string;
};

export type FileUploadFieldAvatarProps = Omit<
  FileUploadFieldSharedProps,
  'existingFiles' | 'onExistingFilesChange'
> & {
  variant: 'avatar';
  /** Existing image URL (e.g. current profile photo). Shown until a new file is chosen. */
  src?: string | null;
  alt?: string;
  /** Shown when there is no image. */
  fallback?: React.ReactNode;
  /** Visual size of the avatar control. */
  avatarSize?: 'default' | 'lg' | 'xl';
};

export type FileUploadFieldProps =
  | FileUploadFieldDefaultProps
  | FileUploadFieldAvatarProps;

const EMPTY_REMOTE_FILES: FileUploadFieldRemoteFile[] = [];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function guessMimeFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext] ?? 'application/octet-stream';
}

function resolveMime(file: File): string {
  return file.type || guessMimeFromFilename(file.name);
}

function resolveRemoteMime(item: FileUploadFieldRemoteFile): string {
  return item.mimeType || guessMimeFromFilename(item.name);
}

type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'archive' | 'other';

function classifyMime(mime: string): PreviewKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || mime.includes('pdf')) return 'pdf';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('compressed') ||
    mime.includes('tar')
  ) {
    return 'archive';
  }
  return 'other';
}

function PreviewIcon({ kind }: { kind: PreviewKind }) {
  const cls = 'size-5 text-muted-foreground';
  switch (kind) {
    case 'pdf':
      return <FileText className={cls} aria-hidden />;
    case 'video':
      return <FileVideo className={cls} aria-hidden />;
    case 'audio':
      return <Music className={cls} aria-hidden />;
    case 'archive':
      return <Archive className={cls} aria-hidden />;
    default:
      return <File className={cls} aria-hidden />;
  }
}

/** Public asset used when an image URL fails to load (broken link, 404, CORS, etc.). */
const FILE_IMAGE_FALLBACK_SRC = '/images/no-image.png';

/**
 * Small list-row image preview: letterboxed fit, then `/images/no-image.png`, then a generic icon
 * if the fallback asset also fails (extremely rare).
 */
function ImageThumbWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [phase, setPhase] = React.useState<'primary' | 'fallback' | 'icon'>(
    'primary',
  );

  React.useEffect(() => {
    queueMicrotask(() => {
      setPhase('primary');
    });
  }, [src]);

  if (phase === 'icon') {
    return (
      <div
        className={cn(
          'bg-muted/80 border-border flex size-10 shrink-0 items-center justify-center rounded-md border',
          className,
        )}
        aria-hidden
      >
        <ImageIcon className='text-muted-foreground size-5' />
      </div>
    );
  }

  const displaySrc = phase === 'fallback' ? FILE_IMAGE_FALLBACK_SRC : src;

  return (
    // Blob / API URLs — not using next/image (no fixed domains for user or remote files)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={cn(
        'border-border bg-muted/50 size-10 rounded-md border object-contain object-center',
        className,
      )}
      onError={() => setPhase((p) => (p === 'primary' ? 'fallback' : 'icon'))}
    />
  );
}

/** Avatar image with the same load fallback chain as list thumbnails; omits the image when both fail. */
function AvatarImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [phase, setPhase] = React.useState<'primary' | 'fallback' | 'gone'>(
    'primary',
  );

  React.useEffect(() => {
    queueMicrotask(() => {
      setPhase('primary');
    });
  }, [src]);

  if (phase === 'gone') return null;

  const displaySrc = phase === 'fallback' ? FILE_IMAGE_FALLBACK_SRC : src;

  /** Placeholder asset is visually heavy at full bleed; inset it so it matches avatar proportions. */
  const isPlaceholderGraphic = displaySrc === FILE_IMAGE_FALLBACK_SRC;

  return (
    <AvatarImage
      src={displaySrc}
      alt={alt}
      className={cn(
        'object-contain object-center',
        isPlaceholderGraphic && 'p-[22%]',
        className,
      )}
      onError={() => setPhase((p) => (p === 'primary' ? 'fallback' : 'gone'))}
    />
  );
}

function FilePreviewSquare({
  objectUrl,
  mime,
}: {
  objectUrl: string | null;
  mime: string;
}) {
  const kind = classifyMime(mime);
  if (kind === 'image' && objectUrl) {
    return <ImageThumbWithFallback src={objectUrl} alt='' />;
  }
  return (
    <div
      className='bg-muted/80 border-border flex size-10 shrink-0 items-center justify-center rounded-md border'
      aria-hidden
    >
      <PreviewIcon kind={kind} />
    </div>
  );
}

function RemotePreviewSquare({ item }: { item: FileUploadFieldRemoteFile }) {
  const mime = resolveRemoteMime(item);
  const kind = classifyMime(mime);
  if (kind === 'image') {
    return <ImageThumbWithFallback src={item.url} alt='' />;
  }
  return (
    <div className='bg-muted/80 border-border flex size-10 shrink-0 items-center justify-center rounded-md border'>
      <PreviewIcon kind={kind} />
    </div>
  );
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function useObjectUrlsForFiles(files: File[]) {
  const [urls, setUrls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const next: Record<string, string> = {};
    files.forEach((file) => {
      if (resolveMime(file).startsWith('image/')) {
        next[fileKey(file)] = URL.createObjectURL(file);
      }
    });
    queueMicrotask(() => {
      setUrls((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return next;
      });
    });
    return () => {
      Object.values(next).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  return React.useCallback((file: File) => urls[fileKey(file)] ?? null, [urls]);
}

/**
 * File upload control with label and error presentation aligned with `TextField` / `ComboBoxField`.
 *
 * Supports single or multiple files, optional drag-and-drop, client-side size checks, `existingFiles` URLs
 * for edit mode, and an `avatar` variant for profile photos. Selection is surfaced via `onFilesChange`.
 */
function FileUploadField(props: FileUploadFieldProps) {
  const {
    label,
    error: errorProp,
    required,
    disabled,
    accept,
    description,
    id: idProp,
    name,
    className,
    maxFileSize,
    onFilesChange,
  } = props;

  const existingFilesProp =
    'existingFiles' in props ? props.existingFiles : undefined;
  const onExistingFilesChange =
    'onExistingFilesChange' in props ? props.onExistingFilesChange : undefined;
  const initialFiles = props.initialFiles;

  const isAvatar = props.variant === 'avatar';
  const multiple =
    !isAvatar && (props as FileUploadFieldDefaultProps).multiple === true;
  const maxFiles = !isAvatar
    ? ((props as FileUploadFieldDefaultProps).maxFiles ?? (multiple ? 10 : 1))
    : 1;
  const emptyHint = !isAvatar
    ? ((props as FileUploadFieldDefaultProps).emptyHint ??
      (multiple ? 'Drag files here or browse' : 'Drag a file here or browse'))
    : '';

  const acceptResolved = accept ?? (isAvatar ? 'image/*' : undefined);

  const avatarSrc = isAvatar
    ? (props as FileUploadFieldAvatarProps).src
    : undefined;
  const avatarAlt = isAvatar
    ? ((props as FileUploadFieldAvatarProps).alt ?? '')
    : '';
  const avatarFallback = isAvatar
    ? (props as FileUploadFieldAvatarProps).fallback
    : undefined;
  const avatarSize = isAvatar
    ? ((props as FileUploadFieldAvatarProps).avatarSize ?? 'lg')
    : 'default';

  const existingFiles = existingFilesProp ?? EMPTY_REMOTE_FILES;

  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const inputId = `${id}-input`;
  const errorId = errorProp ? `${id}-error` : undefined;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>(() => initialFiles ?? []);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const getObjectUrl = useObjectUrlsForFiles(files);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayError = errorProp ?? localError;

  const setFilesAndNotify = React.useCallback(
    (next: File[]) => {
      setFiles(next);
      onFilesChange?.(next);
    },
    [onFilesChange],
  );

  const remoteCount = existingFiles.length;
  const slotsLeft = Math.max(0, maxFiles - remoteCount);

  const applyFiles = React.useCallback(
    (incoming: File[]) => {
      setLocalError(null);
      let list = incoming;

      if (maxFileSize) {
        const rejected = list.filter((f) => f.size > maxFileSize);
        if (rejected.length > 0) {
          setLocalError(
            `File too large (max ${formatBytes(maxFileSize)} per file).`,
          );
          list = list.filter((f) => f.size <= maxFileSize);
        }
      }

      if (!multiple) {
        const one = list[0];
        if (one) {
          setFilesAndNotify([one]);
          if (isAvatar && resolveMime(one).startsWith('image/')) {
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return URL.createObjectURL(one);
            });
          } else if (isAvatar) {
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return null;
            });
          }
        } else {
          setFilesAndNotify([]);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
        }
        return;
      }

      const capped = list.slice(0, slotsLeft);
      if (list.length > slotsLeft) {
        setLocalError(`You can upload at most ${maxFiles} files total.`);
      }
      setFilesAndNotify(capped);
    },
    [isAvatar, maxFileSize, maxFiles, multiple, setFilesAndNotify, slotsLeft],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    applyFiles(list);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const list = Array.from(e.dataTransfer.files);
    applyFiles(list);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const clearAll = () => {
    setFilesAndNotify([]);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeLocalAt = (index: number) => {
    applyFiles(files.filter((_, i) => i !== index));
  };

  const removeRemote = (item: FileUploadFieldRemoteFile) => {
    onExistingFilesChange?.(
      existingFiles.filter(
        (f: FileUploadFieldRemoteFile) =>
          (f.id ?? f.url) !== (item.id ?? item.url),
      ),
    );
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const responsiveLabelClass = cn(
    'font-medium text-xs',
    'md:text-[13px]',
    required
      ? 'after:text-destructive after:ml-0.5 after:content-["*"]'
      : undefined,
  );

  const responsiveErrorClass = cn(
    'text-destructive flex items-center gap-2 font-medium text-xs',
    'md:text-[13px]',
  );

  const dropSurfaceClass = cn(
    'relative flex w-full cursor-pointer items-center rounded-md border border-dashed border-border bg-muted/50 shadow-xs transition-[color,box-shadow]',
    'dark:bg-muted/25',
    'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
    !displayError &&
      'hover:border-muted-foreground/40 hover:bg-muted/70 dark:hover:bg-muted/35',
    displayError &&
      'border-destructive bg-destructive/4 hover:bg-destructive/5 dark:bg-destructive/15 dark:hover:bg-destructive/20',
    disabled && 'pointer-events-none cursor-not-allowed opacity-50',
  );

  const avatarDimensionClass =
    avatarSize === 'xl'
      ? 'size-28 md:size-32'
      : avatarSize === 'lg'
        ? 'size-24 md:size-28'
        : 'size-20 md:size-24';

  /** Always show an image so the circle is never blank (Radix Avatar fallback can stay hidden without an `<img>`). */
  const hasAvatarPhoto = Boolean(previewUrl ?? avatarSrc);
  const resolvedAvatarImageSrc = isAvatar
    ? (previewUrl ?? avatarSrc ?? FILE_IMAGE_FALLBACK_SRC)
    : '';
  const resolvedAvatarAlt = isAvatar
    ? avatarAlt?.trim() ||
      (hasAvatarPhoto ? 'Profile photo' : 'No profile photo')
    : '';

  /** Rows shown in the default uploader: single mode prefers local file over remote. */
  const defaultModeRows = React.useMemo(() => {
    if (isAvatar) return [];
    if (!multiple) {
      if (files[0]) {
        return [{ type: 'local' as const, file: files[0], index: 0 }];
      }
      if (existingFiles[0]) {
        return [{ type: 'remote' as const, item: existingFiles[0] }];
      }
      return [];
    }
    return [
      ...existingFiles.map((item: FileUploadFieldRemoteFile) => ({
        type: 'remote' as const,
        item,
      })),
      ...files.map((file, index) => ({
        type: 'local' as const,
        file,
        index,
      })),
    ];
  }, [isAvatar, multiple, files, existingFiles]);

  const hasListContent = defaultModeRows.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <ShadCNLabel htmlFor={inputId} className={responsiveLabelClass}>
          {label}
        </ShadCNLabel>
      )}
      {description ? (
        <p className='text-muted-foreground text-xs font-semibold'>
          {description}
        </p>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type='file'
        accept={acceptResolved}
        multiple={multiple}
        disabled={disabled}
        className='sr-only'
        aria-invalid={displayError ? true : undefined}
        aria-describedby={errorId}
        onChange={onInputChange}
      />

      {isAvatar ? (
        <div className='flex flex-col items-start gap-3'>
          <button
            type='button'
            disabled={disabled}
            onClick={openPicker}
            className={cn(
              'group focus-visible:ring-ring/50 relative rounded-full outline-none focus-visible:ring-[3px]',
              displayError && 'ring-destructive/30 ring-2',
            )}
            aria-label={label ?? 'Upload profile photo'}
          >
            <Avatar
              className={cn(
                avatarDimensionClass,
                'bg-muted/40 dark:border-input dark:bg-muted/30 border border-neutral-200 shadow-xs',
                displayError && 'border-destructive',
              )}
            >
              <AvatarImageWithFallback
                src={resolvedAvatarImageSrc}
                alt={resolvedAvatarAlt}
              />
              <AvatarFallback className='bg-muted/80 text-muted-foreground text-lg'>
                {avatarFallback ?? <ImageIcon className='size-8 opacity-60' />}
              </AvatarFallback>
            </Avatar>
            {/* Neutral scrim — avoids heavy primary blue on hover (aligns with form field aesthetics) */}
            <span
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity',
                'bg-black/25 text-white backdrop-blur-[1px]',
                'dark:bg-black/35',
                'group-hover:opacity-100 group-focus-visible:opacity-100',
                disabled && 'hidden',
              )}
              aria-hidden
            >
              <Upload className='size-5 drop-shadow-sm' />
            </span>
          </button>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={disabled}
              onClick={openPicker}
              className={cn(
                'h-8 border-neutral-200 bg-transparent px-2.5 text-xs font-medium shadow-xs',
                'md:px-3',
              )}
            >
              Choose photo
            </Button>
            {(files.length > 0 || previewUrl) && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={disabled}
                onClick={clearAll}
                className={cn(
                  'text-muted-foreground h-8 px-2.5 text-xs font-medium shadow-none',
                  'hover:bg-muted/60 hover:text-foreground',
                  'md:px-3',
                )}
              >
                Remove
              </Button>
            )}
          </div>
          {!description && (
            <p className='text-muted-foreground max-w-xs text-xs'>
              PNG, JPG or WebP. Square images look best in the profile circle.
            </p>
          )}
        </div>
      ) : (
        <div>
          <div
            role='button'
            tabIndex={disabled ? -1 : 0}
            onClick={openPicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPicker();
              }
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn(
              dropSurfaceClass,
              'min-h-10 flex-col gap-2 px-3 py-3 md:min-h-12 md:px-4',
            )}
          >
            <div className='text-muted-foreground flex items-center gap-2 text-xs md:text-sm'>
              <Upload className='size-4 shrink-0' aria-hidden />
              <span className='text-foreground text-[13px] font-medium capitalize'>
                {emptyHint}
              </span>
            </div>
            {!hasListContent ? (
              <span className='text-muted-foreground text-xs'>
                {accept ? `Accepted: ${accept}` : 'Any file type'}
                {maxFileSize ? ` · Max ${formatBytes(maxFileSize)} each` : null}
              </span>
            ) : (
              <ul className='w-full space-y-2'>
                {defaultModeRows.map((row) =>
                  row.type === 'remote' ? (
                    <li
                      key={row.item.id ?? row.item.url}
                      className='bg-muted/50 border-border flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs md:text-sm'
                    >
                      <RemotePreviewSquare item={row.item} />
                      <span className='min-w-0 flex-1 truncate font-medium'>
                        {row.item.name}
                      </span>
                      {row.item.sizeBytes != null ? (
                        <span className='text-muted-foreground shrink-0 text-xs'>
                          {formatBytes(row.item.sizeBytes)}
                        </span>
                      ) : (
                        <span className='text-muted-foreground shrink-0 text-xs'>
                          Saved
                        </span>
                      )}
                      <button
                        type='button'
                        disabled={disabled}
                        className='text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-1'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRemote(row.item);
                        }}
                        aria-label={`Remove ${row.item.name}`}
                      >
                        <X className='size-4' />
                      </button>
                    </li>
                  ) : (
                    <li
                      key={`${row.file.name}-${row.file.size}-${row.index}`}
                      className='bg-muted/50 border-border flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs md:text-sm'
                    >
                      <FilePreviewSquare
                        objectUrl={getObjectUrl(row.file)}
                        mime={resolveMime(row.file)}
                      />
                      <span className='min-w-0 flex-1 truncate font-medium'>
                        {row.file.name}
                      </span>
                      <span className='text-muted-foreground shrink-0 text-xs'>
                        {formatBytes(row.file.size)}
                      </span>
                      <button
                        type='button'
                        disabled={disabled}
                        className='text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-1'
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocalAt(row.index);
                        }}
                        aria-label={`Remove ${row.file.name}`}
                      >
                        <X className='size-4' />
                      </button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {displayError && (
        <p id={errorId} className={responsiveErrorClass} role='alert'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}

export default FileUploadField;
