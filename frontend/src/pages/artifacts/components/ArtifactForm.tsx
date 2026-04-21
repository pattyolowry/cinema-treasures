import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertCircle, ImagePlus, X } from 'lucide-react';
import { MEMBERS } from '../../../data';
import serviceUtils from '../../../services/utils';
import type { Blog, Member, NewBlog } from '../../../types';

export interface ArtifactFormSubmitValue {
  file: File | null;
  blog: NewBlog;
}

interface ArtifactFormProps {
  blog?: Blog | null;
  onClose: () => void;
  onSave: (value: ArtifactFormSubmitValue) => void;
  isSubmitting?: boolean;
  externalError?: string | null;
}

interface ArtifactFormState {
  title: string;
  authors: Member[];
  url: string;
  date: string;
  shortDescription: string;
}

const formatDateForInput = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
};

export function ArtifactForm({
  blog,
  onClose,
  onSave,
  isSubmitting = false,
  externalError = null,
}: ArtifactFormProps) {
  const isCreateMode = !blog;
  const [formData, setFormData] = useState<ArtifactFormState>({
    title: blog?.title ?? '',
    authors: blog?.authors ?? [],
    url: blog?.url ?? '',
    date: blog ? formatDateForInput(blog.date) : '',
    shortDescription: blog?.shortDescription ?? '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    blog?.imageKey ? serviceUtils.blogImageUrl(blog.imageKey) : null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAuthorToggle = (author: Member) => {
    setFormData((current) => {
      const authors = current.authors.includes(author)
        ? current.authors.filter((currentAuthor) => currentAuthor !== author)
        : [...current.authors, author];

      return { ...current, authors };
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (formData.authors.length === 0) {
      setFormError('Select at least one author.');
      return;
    }

    if (isCreateMode && !selectedFile) {
      setFormError('An image is required when creating a new artifact.');
      return;
    }

    const parsedDate = new Date(`${formData.date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      setFormError('Enter a valid publication date.');
      return;
    }

    onSave({
      file: selectedFile,
      blog: {
        title: formData.title.trim(),
        authors: formData.authors,
        url: formData.url.trim(),
        date: parsedDate,
        shortDescription: formData.shortDescription.trim() || undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-2xl border border-[var(--color-gold-600)]/30 bg-[var(--color-cinema-dark)] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-cinema-gray)] p-6">
            <div>
              <h2 className="text-2xl font-serif text-[var(--color-gold-400)]">
                {isCreateMode ? 'Add Artifact' : 'Edit Artifact'}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-silver-500)]">
                {isCreateMode
                  ? 'Archive an old presentation, post, or movie club dispatch.'
                  : 'Update the existing entry metadata.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[var(--color-silver-500)] transition-colors hover:bg-[var(--color-cinema-gray)] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {(formError || externalError) && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/50 bg-red-900/30 px-4 py-3 text-sm text-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{formError ?? externalError}</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Title
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-2 text-white transition-all focus:border-[var(--color-gold-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-500)]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Blog URL
                </label>
                <input
                  required
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-2 text-white transition-all focus:border-[var(--color-gold-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-500)]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleFieldChange}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-3 text-white transition-all focus:border-[var(--color-gold-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-500)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Publication Date
                </label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-2 text-white transition-all focus:border-[var(--color-gold-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-500)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Cover Image
                </label>
                {isCreateMode ? (
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-gold-600)]/50 bg-[var(--color-cinema-black)] px-4 py-4 text-sm text-[var(--color-silver-300)] transition-colors hover:border-[var(--color-gold-500)] hover:text-white">
                    <ImagePlus size={18} className="text-[var(--color-gold-400)]" />
                    <span>{selectedFile ? selectedFile.name : 'Upload a 16:9 image'}</span>
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="rounded-lg border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] px-4 py-4 text-sm text-[var(--color-silver-500)]">
                    Image updates are not supported yet for existing artifacts.
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="md:col-span-2">
                  <div className="overflow-hidden rounded-xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]">
                    <img
                      src={previewUrl}
                      alt={formData.title ? `${formData.title} preview` : 'Artifact preview'}
                      className="aspect-video w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-silver-400)]">
                  Authors
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {MEMBERS.map((member) => {
                    const isSelected = formData.authors.includes(member);

                    return (
                      <button
                        key={member}
                        type="button"
                        onClick={() => handleAuthorToggle(member)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-[var(--color-gold-500)] bg-[var(--color-gold-500)] text-black'
                            : 'border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)] text-[var(--color-silver-300)] hover:border-[var(--color-gold-600)] hover:text-white'
                        }`}
                      >
                        {member}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-cinema-gray)] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--color-cinema-gray)] px-4 py-2 text-sm font-medium text-[var(--color-silver-400)] transition-colors hover:bg-[var(--color-cinema-gray)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[var(--color-gold-500)] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[var(--color-gold-400)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : isCreateMode ? 'Add Artifact' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
