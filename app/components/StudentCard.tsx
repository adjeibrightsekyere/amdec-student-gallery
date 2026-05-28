import { Student } from "../types/student";

export default function StudentCard({ student }: { student: Student }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-950/90 dark:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-600">Student</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{student.name}</h2>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-6">
        {student.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${student.name} ${i + 1}`}
            className="h-full w-full rounded-2xl object-cover shadow-sm"
          />
        ))}
      </div>
    </article>
  );
}