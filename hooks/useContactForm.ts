'use client';

import { useState } from 'react';

import { ENDPOINTS } from '@/config/api/endpoints';
import { http } from '@/lib/api/client';
import { reportNotableApiClientError } from '@/lib/sentry/client';

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

const INITIAL_DATA: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export const useContactForm = () => {
  const [data, setData] = useState<ContactFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [processing, setProcessing] = useState(false);

  const setField = (field: keyof ContactFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {};

    if (!data.name.trim()) newErrors.name = 'Full name is required.';
    if (!data.email.trim()) newErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      newErrors.email = 'Please enter a valid email address.';
    if (!data.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!data.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!data.message.trim()) newErrors.message = 'Message is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setData(INITIAL_DATA);
    setErrors({});
  };

  const submit = async (
    onSuccess: () => void,
    onError: (msg: string) => void,
  ) => {
    if (!validate()) return;

    setProcessing(true);

    try {
      const res = await http.post(ENDPOINTS.MARKETING.CONTACT, data, {
        throwOnError: false,
      });

      if (res.status === 'success') {
        onSuccess();
        reset();
      } else {
        if (res.errors) {
          const fieldErrors: ContactFormErrors = {};
          for (const [key, value] of Object.entries(res.errors)) {
            fieldErrors[key as keyof ContactFormData] = Array.isArray(value)
              ? value[0]
              : String(value);
          }
          setErrors(fieldErrors);
        }
        onError(res.message ?? 'Failed to send message.');
      }
    } catch (caught) {
      reportNotableApiClientError(caught);
      onError('Failed to send message. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return { data, errors, processing, setField, submit, reset };
};
