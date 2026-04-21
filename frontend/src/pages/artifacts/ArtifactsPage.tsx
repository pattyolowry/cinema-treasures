import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Archive, CalendarDays, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppSession } from '../../context/AppSessionContext';
import blogService from '../../services/blogs';
import serviceUtils from '../../services/utils';
import type { Blog, NewBlog } from '../../types';
import { ArtifactForm, type ArtifactFormSubmitValue } from './components/ArtifactForm';

const BLOGS_QUERY_KEY = ['artifactBlogs'] as const;
const BLOGS_ERROR_MESSAGE = 'Unable to load artifacts right now. Please try again.';
const BLOGS_SAVE_ERROR_MESSAGE = 'Unable to save this artifact right now. Please try again.';
const BLOGS_DELETE_ERROR_MESSAGE = 'Unable to delete this artifact right now. Please try again.';

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: unknown } } }).response;
    if (typeof response?.data?.error === 'string') {
      return response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function sortBlogs(blogs: Blog[]) {
  return [...blogs].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

function formatBlogDate(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate);
}

export default function ArtifactsPage() {
  const { currentUser } = useAppSession();
  const queryClient = useQueryClient();
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [areAdminActionsVisible, setAreAdminActionsVisible] = useState(false);

  const blogsQuery = useQuery({
    queryKey: BLOGS_QUERY_KEY,
    queryFn: blogService.getAllBlogs,
    enabled: !!currentUser,
  });

  const createBlogMutation = useMutation({
    mutationFn: ({ file, blog }: ArtifactFormSubmitValue) => blogService.addBlog(file, blog),
    onMutate: () => {
      setActionErrorMessage(null);
    },
    onSuccess: (savedBlog) => {
      queryClient.setQueryData<Blog[]>(BLOGS_QUERY_KEY, (currentBlogs = []) => sortBlogs([...currentBlogs, savedBlog]));
      setIsFormOpen(false);
      setEditingBlog(null);
    },
    onError: (error: unknown) => {
      setActionErrorMessage(getRequestErrorMessage(error, BLOGS_SAVE_ERROR_MESSAGE));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BLOGS_QUERY_KEY });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }: { id: string; blog: NewBlog }) => blogService.updateBlog(id, blog),
    onMutate: () => {
      setActionErrorMessage(null);
    },
    onSuccess: (updatedBlog) => {
      queryClient.setQueryData<Blog[]>(BLOGS_QUERY_KEY, (currentBlogs = []) =>
        sortBlogs(currentBlogs.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))),
      );
      setIsFormOpen(false);
      setEditingBlog(null);
    },
    onError: (error: unknown) => {
      setActionErrorMessage(getRequestErrorMessage(error, BLOGS_SAVE_ERROR_MESSAGE));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BLOGS_QUERY_KEY });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: blogService.deleteBlog,
    onMutate: async (id: string) => {
      setActionErrorMessage(null);
      await queryClient.cancelQueries({ queryKey: BLOGS_QUERY_KEY });
      const previousBlogs = queryClient.getQueryData<Blog[]>(BLOGS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Blog[]>(BLOGS_QUERY_KEY, previousBlogs.filter((blog) => blog.id !== id));
      return { previousBlogs };
    },
    onError: (error: unknown, _id, context) => {
      if (context) {
        queryClient.setQueryData(BLOGS_QUERY_KEY, context.previousBlogs);
      }
      setActionErrorMessage(getRequestErrorMessage(error, BLOGS_DELETE_ERROR_MESSAGE));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BLOGS_QUERY_KEY });
    },
  });

  const blogs = useMemo(() => sortBlogs(blogsQuery.data ?? []), [blogsQuery.data]);
  const errorMessage =
    actionErrorMessage ?? (blogsQuery.error ? getRequestErrorMessage(blogsQuery.error, BLOGS_ERROR_MESSAGE) : null);
  const isInitialLoading = !!currentUser && blogsQuery.isPending && !blogsQuery.data;
  const isRefreshing = !!currentUser && blogsQuery.isFetching && !!blogsQuery.data;
  const isSaving = createBlogMutation.isPending || updateBlogMutation.isPending;
  const adminActionsToggleLabel = areAdminActionsVisible
    ? 'Hide artifact edit and delete controls'
    : 'Show artifact edit and delete controls';

  const openAddForm = () => {
    setActionErrorMessage(null);
    setEditingBlog(null);
    setIsFormOpen(true);
  };

  const openEditForm = (blog: Blog) => {
    setActionErrorMessage(null);
    setEditingBlog(blog);
    setIsFormOpen(true);
  };

  const handleSaveBlog = async ({ file, blog }: ArtifactFormSubmitValue) => {
    try {
      if (editingBlog) {
        await updateBlogMutation.mutateAsync({ id: editingBlog.id, blog });
      } else {
        await createBlogMutation.mutateAsync({ file, blog });
      }
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  const handleDeleteBlog = async (blog: Blog) => {
    if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      return;
    }

    try {
      await deleteBlogMutation.mutateAsync(blog.id);
      if (editingBlog?.id === blog.id) {
        setEditingBlog(null);
        setIsFormOpen(false);
      }
    } catch {
      // Mutation errors are surfaced via onError to keep messages consistent.
    }
  };

  if (!currentUser) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="border-b border-[var(--color-cinema-gray)] bg-gradient-to-r from-[var(--color-cinema-black)] via-[#241a15] to-[var(--color-cinema-dark)] px-6 py-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-gold-600)]/40 bg-[var(--color-cinema-black)]/50 px-4 py-2 text-sm uppercase tracking-[0.2em] text-[var(--color-gold-400)]">
              <Archive size={16} />
              Artifacts
            </div>
            <h2 className="mt-5 text-3xl font-serif text-white sm:text-4xl">Members-only archive</h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-silver-400)] sm:text-base">
              Old presentations, essays, and club posts live here. This archive is only visible to signed-in club members.
            </p>
          </div>

          <div className="px-6 py-10">
            <div className="rounded-2xl border border-dashed border-[var(--color-gold-600)]/40 bg-[var(--color-cinema-black)]/55 p-8 text-center">
              <FileText className="mx-auto text-[var(--color-gold-400)]" size={30} />
              <p className="mt-4 text-lg font-serif text-white">Artifacts are locked</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-silver-500)]">
                Sign in with a member account to browse the archive of posts and presentations.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-serif text-white">
              <Archive className="text-[var(--color-gold-500)]" size={28} />
              Artifacts
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-silver-400)] sm:text-base">
              An archive of club posts and presentations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAreAdminActionsVisible((current) => !current)}
              aria-label={adminActionsToggleLabel}
              title={adminActionsToggleLabel}
              aria-pressed={areAdminActionsVisible}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                areAdminActionsVisible
                  ? 'border-[var(--color-gold-500)] bg-[var(--color-gold-500)] text-black'
                  : 'border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)] text-[var(--color-silver-300)] hover:border-[var(--color-gold-600)] hover:text-[var(--color-gold-400)]'
              }`}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-gold-500)] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[var(--color-gold-400)]"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/50 bg-red-900/30 px-4 py-3 text-sm text-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActionErrorMessage(null);
                void blogsQuery.refetch();
              }}
              className="shrink-0 rounded-full border border-red-200/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-100 hover:bg-red-200/10"
            >
              Retry
            </button>
          </div>
        )}

        {isRefreshing && (
          <p className="mb-4 text-xs uppercase tracking-wider text-[var(--color-silver-500)]">Refreshing artifacts...</p>
        )}

        {isInitialLoading ? (
          <div className="rounded-2xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 p-12 text-center text-[var(--color-silver-400)]">
            Loading artifacts...
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 p-12 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <Archive className="mx-auto text-[var(--color-gold-400)]" size={32} />
            <h3 className="mt-4 text-2xl font-serif text-white">No artifacts yet</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-silver-500)]">
              Start the archive by adding the club&apos;s first preserved presentation or post.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {blogs.map((blog) => {
              const imageUrl = serviceUtils.blogImageUrl(blog.imageKey);

              return (
                <article
                  key={blog.id}
                  className="overflow-hidden rounded-2xl border border-[var(--color-cinema-gray)] bg-[var(--color-cinema-dark)]/85 shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                >
                  {imageUrl && (
                    <div className="overflow-hidden border-b border-[var(--color-cinema-gray)] bg-[var(--color-cinema-black)]">
                      <img
                        src={imageUrl}
                        alt={`${blog.title} cover art`}
                        className="aspect-video w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-silver-500)]">
                      <span>{blog.authors.join(', ')}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--color-gold-500)]" />
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-[var(--color-gold-400)]" />
                        {formatBlogDate(blog.date)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-serif leading-tight">
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white transition-colors hover:text-[var(--color-gold-400)] focus:outline-none focus-visible:text-[var(--color-gold-400)] focus-visible:underline"
                      >
                        {blog.title}
                      </a>
                    </h3>

                    {blog.shortDescription?.trim() && (
                      <p className="mt-2 text-sm leading-5 text-[var(--color-silver-500)]">
                        {blog.shortDescription.trim()}
                      </p>
                    )}

                    {areAdminActionsVisible && (
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(blog)}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cinema-gray)] px-4 py-2 text-sm font-medium text-[var(--color-silver-300)] transition-colors hover:border-[var(--color-gold-600)] hover:text-white"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteBlog(blog)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isFormOpen && (
        <ArtifactForm
          blog={editingBlog}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBlog(null);
            setActionErrorMessage(null);
          }}
          onSave={handleSaveBlog}
          isSubmitting={isSaving}
          externalError={actionErrorMessage}
        />
      )}
    </>
  );
}
