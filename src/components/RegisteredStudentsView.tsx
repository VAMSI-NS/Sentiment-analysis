import React, { useEffect, useState } from 'react';
import { AlertCircle, Users } from 'lucide-react';
import { StudentRecord } from '../types';
import { getAdminStudents } from '../api';

export const RegisteredStudentsView: React.FC = () => {
  const pageSize = 50;
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAdminStudents({ limit: pageSize, offset })
      .then((result) => {
        if (active) {
          setStudents(result.items);
          setTotal(result.total);
          setError('');
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load student accounts.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [offset]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-1">Administration</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a]">Registered students</h1>
        <p className="text-sm text-slate-500 mt-1">Student accounts and their saved feedback activity.</p>
      </div>
      {error && <div role="alert" className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-800 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          <div>
            <h2 className="font-bold text-slate-900">Student accounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">{total.toLocaleString()} registered</p>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400" role="status">Loading student accounts…</div>
        ) : students.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Registered</th>
                  <th className="px-5 py-3 font-semibold">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{student.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(student.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{student.feedback_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-400">{total ? 'No student records on this page.' : 'No student accounts have registered yet.'}</div>
        )}
        {total > pageSize && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {offset + 1}–{Math.min(offset + pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - pageSize))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + pageSize >= total}
                onClick={() => setOffset(offset + pageSize)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
