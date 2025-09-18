type Props = { message: string; onClose?: () => void; title?: string };
export default function ErrorBanner({
  message,
  onClose,
  title = "Something went wrong",
}: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-80">{message || "An error occurred"}</p>
        </div>
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Close error message"
            className="rounded px-2 py-1 text-sm underline"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
