'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';

interface AddActionPlannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (
    data: AddActionPlannerFormData,
    isEdit: boolean,
    id?: string
  ) => void;
  initialData?: Partial<AddActionPlannerFormData> & {
    id?: string;
    imageUrl?: string | null;
  };
  mode?: 'create' | 'edit';
}

export interface AddActionPlannerFormData {
  username: string;
  name: string;
  surname: string;
  fullName: string;
  image?: File | null;
  dateOfBirth: string;
  category: string;
  annotation: string;
  startDate: string;
  email: string;
}

export function AddActionPlannerDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: AddActionPlannerDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<AddActionPlannerFormData>({
    username: '',
    name: '',
    surname: '',
    fullName: '',
    image: null,
    dateOfBirth: '',
    category: '',
    annotation: '',
    startDate: '',
    email: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddActionPlannerFormData, string>>
  >({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddActionPlannerFormData, string>> =
      {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username =
        'Username can only contain letters, numbers, and underscores';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Surname validation
    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    } else if (formData.surname.trim().length < 2) {
      newErrors.surname = 'Surname must be at least 2 characters';
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Category validation
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.trim().length < 2) {
      newErrors.category = 'Category must be at least 2 characters';
    }

    // Start Date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = 'Please enter a valid start date';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Populate form when dialog opens or mode/initialData changes
  useEffect(() => {
    if (!isOpen) {
      // Reset when closed
      setFormData({
        username: '',
        name: '',
        surname: '',
        fullName: '',
        image: null,
        dateOfBirth: '',
        category: '',
        annotation: '',
        startDate: '',
        email: '',
      });
      setImagePreview(null);
      setErrors({});
      return;
    }

    if (mode === 'edit' && initialData) {
      // Populate form with initial data for edit mode
      const name = initialData.name || '';
      const surname = initialData.surname || '';
      setFormData({
        username: initialData.username || '',
        name: name,
        surname: surname,
        fullName: initialData.fullName || `${name} ${surname}`.trim(),
        image: null,
        dateOfBirth: initialData.dateOfBirth || '',
        category: initialData.category || '',
        annotation: initialData.annotation || '',
        startDate: initialData.startDate || '',
        email: initialData.email || '',
      });
      // Set image preview if imageUrl exists
      setImagePreview(initialData.imageUrl || null);
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        username: '',
        name: '',
        surname: '',
        fullName: '',
        image: null,
        dateOfBirth: '',
        category: '',
        annotation: '',
        startDate: '',
        email: '',
      });
      setImagePreview(null);
      setErrors({});
    }
    // This effect intentionally updates form state when dialog opens/changes mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-compute fullName when name or surname changes
      if (name === 'name' || name === 'surname') {
        updated.fullName = `${updated.name} ${updated.surname}`.trim();
      }
      return updated;
    });
    // Clear error for this field when user starts typing
    if (errors[name as keyof AddActionPlannerFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof AddActionPlannerFormData];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Ensure fullName is computed before submit
    const finalFormData = {
      ...formData,
      fullName: `${formData.name} ${formData.surname}`.trim(),
    };

    const isEdit = mode === 'edit';
    onSubmit?.(finalFormData, isEdit, initialData?.id);
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      name: '',
      surname: '',
      fullName: '',
      image: null,
      dateOfBirth: '',
      category: '',
      annotation: '',
      startDate: '',
      email: '',
    });
    setImagePreview(null);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close dialog if clicking on the backdrop (not the dialog content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">
          {mode === 'edit' ? 'Edit Action Planner' : 'Add Action Planner'}
        </h2>
        <div className="mb-6 border-b border-slate-200"></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Username:
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.username
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.username && (
              <p className="ml-36 text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.name && (
              <p className="ml-36 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Surname */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Surname:
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.surname
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.surname && (
              <p className="ml-36 text-xs text-red-500">{errors.surname}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm font-medium text-slate-700">
              Image:
            </label>
            <div className="flex items-center gap-3">
              <div className="h-24 w-24 rounded border-2 border-slate-300 bg-slate-100 shadow-sm">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    {/* Empty box */}
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="rounded bg-slate-500 px-4 py-2 text-sm text-white transition hover:bg-slate-600">
                  Select
                </span>
              </label>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Date of birth:
              </label>
              <div className="relative flex-1">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 pr-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.dateOfBirth
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            {errors.dateOfBirth && (
              <p className="ml-36 text-xs text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Category:
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.category
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.category && (
              <p className="ml-36 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Annotation */}
          <div className="flex items-center gap-4">
            <label className="w-32 text-sm font-medium text-slate-700">
              Annotation:
            </label>
            <textarea
              name="annotation"
              value={formData.annotation}
              onChange={handleInputChange}
              rows={3}
              className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                Start date:
              </label>
              <div className="relative flex-1">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full rounded border px-3 py-2 pr-2 text-sm focus:outline-none focus:ring-1 ${
                    errors.startDate
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>
            {errors.startDate && (
              <p className="ml-36 text-xs text-red-500">{errors.startDate}</p>
            )}
          </div>

          {/* E-Mail */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium text-slate-700">
                E-Mail:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="ml-36 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded bg-slate-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            >
              {mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
