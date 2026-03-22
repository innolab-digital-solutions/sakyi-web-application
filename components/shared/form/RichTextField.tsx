'use client';

import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Label as ShadCNLabel } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/styles';

/**
 * Toolbar icon control: small outlined buttons; active tools only change background (border stays
 * neutral like inactive controls).
 */
function EditorToolbarIconButton({
  active = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'variant' | 'size'> & {
  active?: boolean;
}) {
  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className={cn(
        'bg-background h-8 w-8 shrink-0 rounded-md border-neutral-200 p-0 shadow-xs',
        'md:h-9 md:w-9',
        'text-foreground text-[11px] font-medium md:text-xs',
        'hover:bg-muted/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
        active &&
          'bg-primary/15 text-foreground dark:border-input dark:bg-primary/22 border-neutral-200',
        className,
      )}
      aria-pressed={active}
      data-state={active ? 'on' : 'off'}
      {...props}
    />
  );
}

/**
 * Props for `RichTextField`. Rich HTML via TipTap; optional label, description, and error
 * aligned with `TextField` / `TextAreaField`.
 */
export type RichTextFieldProps = {
  id?: string;
  label?: string;
  error?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  editorClassName?: string;
};

/**
 * Rich text field with the same toolbar as the legacy editor: headings, lists, link,
 * alignment, undo/redo, etc. Outputs HTML via `onChange`.
 */
export default function RichTextField({
  id: idProp,
  label,
  error,
  description,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  editorClassName,
}: RichTextFieldProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: true,
          autolink: true,
          linkOnPaste: true,
        }),
      ],
      content: value ?? '',
      editorProps: {
        attributes: {
          id,
          class:
            'focus:outline-none min-h-[160px] px-3 py-2.5 text-xs font-medium leading-relaxed md:px-4 md:py-3 md:text-sm',
          ...(error ? { 'aria-invalid': 'true' as const } : {}),
          ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        },
      },
      editable: !disabled,
      onUpdate: ({ editor }: { editor: { getHTML: () => string } }) => {
        onChange?.(editor.getHTML());
      },
    },
    [id],
  );

  /** Re-render toolbar when selection or marks change so `isActive()` stays in sync. */
  const [, setToolbarTick] = React.useState(0);
  React.useEffect(() => {
    if (!editor) return;
    const sync = () => setToolbarTick((n) => n + 1);
    editor.on('transaction', sync);
    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== undefined && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  React.useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    if (error) {
      dom.setAttribute('aria-invalid', 'true');
    } else {
      dom.removeAttribute('aria-invalid');
    }
    if (describedBy) {
      dom.setAttribute('aria-describedby', describedBy);
    } else {
      dom.removeAttribute('aria-describedby');
    }
  }, [editor, error, describedBy]);

  const hasError = Boolean(error);

  const blockTypeValue =
    editor && editor.isActive('heading', { level: 1 })
      ? 'heading1'
      : editor && editor.isActive('heading', { level: 2 })
        ? 'heading2'
        : editor && editor.isActive('heading', { level: 3 })
          ? 'heading3'
          : 'paragraph';

  const responsiveLabelClass = cn(
    'font-medium text-xs',
    'md:text-sm',
    required
      ? 'after:text-destructive after:ml-0.5 after:content-["*"]'
      : undefined,
  );

  const responsiveErrorClass = cn(
    'text-destructive flex items-center gap-2 font-medium text-xs',
    'md:text-sm',
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <ShadCNLabel htmlFor={id} className={responsiveLabelClass}>
          {label}
        </ShadCNLabel>
      ) : null}

      <div
        className={cn(
          'flex min-h-55 flex-col overflow-hidden rounded-md border border-neutral-200 bg-transparent font-medium shadow-xs transition-[color,box-shadow] outline-none',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          'disabled:cursor-not-allowed',
          hasError &&
            'border-destructive bg-destructive/4 focus-within:ring-destructive/20',
          disabled && 'pointer-events-none opacity-50',
          editorClassName,
        )}
      >
        <div className='bg-muted/30 border-b border-neutral-200 px-1.5 py-1 md:px-2 md:py-1.5'>
          <TooltipProvider delayDuration={150}>
            <div className='flex flex-wrap items-center justify-between gap-1'>
              <div className='flex flex-wrap items-center gap-0.5'>
                <Select
                  value={blockTypeValue}
                  onValueChange={(v) => {
                    if (!editor) return;
                    const chain = editor.chain().focus();
                    switch (v) {
                      case 'heading1': {
                        chain.toggleHeading({ level: 1 }).run();
                        break;
                      }
                      case 'heading2': {
                        chain.toggleHeading({ level: 2 }).run();
                        break;
                      }
                      case 'heading3': {
                        chain.toggleHeading({ level: 3 }).run();
                        break;
                      }
                      default: {
                        chain.setParagraph().run();
                        break;
                      }
                    }
                  }}
                  disabled={!editor || disabled}
                >
                  <SelectTrigger className='bg-background focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-[min(118px,100%)] rounded-md border border-neutral-200 px-2 py-0 text-[11px] font-medium shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] data-[size=default]:h-8 md:px-2.5 md:text-xs md:data-[size=default]:h-9'>
                    <SelectValue placeholder='Paragraph' />
                  </SelectTrigger>
                  <SelectContent className='rounded-sm'>
                    <SelectItem value='paragraph' className='text-xs!'>
                      Paragraph
                    </SelectItem>
                    <SelectItem value='heading1' className='text-xs!'>
                      Heading 1
                    </SelectItem>
                    <SelectItem value='heading2' className='text-xs!'>
                      Heading 2
                    </SelectItem>
                    <SelectItem value='heading3' className='text-xs!'>
                      Heading 3
                    </SelectItem>
                  </SelectContent>
                </Select>

                <span className='mx-1 h-5 w-px bg-neutral-200' />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('bold') ?? false}
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      disabled={
                        !editor || !editor.can().toggleBold() || disabled
                      }
                      aria-label='Bold'
                    >
                      <Bold className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Bold</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      onClick={() =>
                        editor?.chain().focus().setHorizontalRule().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Horizontal rule'
                    >
                      <Minus className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Horizontal rule</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('italic') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                      disabled={
                        !editor || !editor.can().toggleItalic() || disabled
                      }
                      aria-label='Italic'
                    >
                      <Italic className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('underline') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleUnderline().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Underline'
                    >
                      <UnderlineIcon className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Underline</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('strike') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Strikethrough'
                    >
                      <Strikethrough className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Strikethrough</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('bulletList') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Bulleted list'
                    >
                      <ListTodo className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Bulleted list</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('orderedList') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Numbered list'
                    >
                      <ListOrdered className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Numbered list</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('blockquote') ?? false}
                      onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Quote'
                    >
                      <Quote className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Quote</TooltipContent>
                </Tooltip>

                <span className='mx-1 h-5 w-px bg-neutral-200' />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive('link') ?? false}
                      onClick={() => {
                        if (!editor) return;
                        const previousUrl = editor.getAttributes('link')
                          .href as string | undefined;
                        const url = globalThis.prompt(
                          'Enter URL',
                          previousUrl ?? 'https://',
                        );
                        if (url === null) return;
                        if (url === '') {
                          editor
                            .chain()
                            .focus()
                            .extendMarkRange('link')
                            .unsetLink()
                            .run();
                          return;
                        }
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange('link')
                          .setLink({ href: url })
                          .run();
                      }}
                      disabled={!editor || disabled}
                      aria-label='Insert link'
                    >
                      <Link2 className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Insert link</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      onClick={() =>
                        editor?.chain().focus().sinkListItem('listItem').run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Increase indent'
                    >
                      <IndentIncrease className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Increase indent</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      onClick={() =>
                        editor?.chain().focus().liftListItem('listItem').run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Decrease indent'
                    >
                      <IndentDecrease className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Decrease indent</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive({ textAlign: 'left' }) ?? false}
                      onClick={() =>
                        editor?.chain().focus().setTextAlign('left').run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Align left'
                    >
                      <AlignLeft className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Align left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={
                        editor?.isActive({ textAlign: 'center' }) ?? false
                      }
                      onClick={() =>
                        editor?.chain().focus().setTextAlign('center').run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Align center'
                    >
                      <AlignCenter className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Align center</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      active={editor?.isActive({ textAlign: 'right' }) ?? false}
                      onClick={() =>
                        editor?.chain().focus().setTextAlign('right').run()
                      }
                      disabled={!editor || disabled}
                      aria-label='Align right'
                    >
                      <AlignRight className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Align right</TooltipContent>
                </Tooltip>
              </div>

              <div className='flex items-center gap-0.5'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      className='disabled:opacity-40'
                      onClick={() =>
                        editor
                          ?.chain()
                          .focus()
                          .clearNodes()
                          .unsetAllMarks()
                          .run()
                      }
                      disabled={!editor || disabled}
                    >
                      <Eraser className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Clear formatting</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      className='disabled:opacity-40'
                      onClick={() => editor?.chain().focus().undo().run()}
                      disabled={!editor || !editor.can().undo() || disabled}
                      aria-label='Undo'
                    >
                      <Undo2 className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Undo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <EditorToolbarIconButton
                      className='disabled:opacity-40'
                      onClick={() => editor?.chain().focus().redo().run()}
                      disabled={!editor || !editor.can().redo() || disabled}
                      aria-label='Redo'
                    >
                      <Redo2 className='h-3 w-3' />
                    </EditorToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Redo</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>

        <div
          className={cn(
            'text-foreground dark:bg-background min-h-45 bg-white',
            '[&_a]:text-primary [&_a:hover]:text-primary/80 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:mb-1 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-1 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
            'placeholder:text-muted-foreground',
          )}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {description ? (
        <p
          className='text-muted-foreground text-xs md:text-sm'
          id={descriptionId}
        >
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={responsiveErrorClass} role='alert'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
