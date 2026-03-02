"use client";

import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 2000);
            }
        } catch {
            setError("Đã xảy ra lỗi không mong muốn.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

            <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
                <motion.div
                    className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl mb-5 shadow-sm ring-1 ring-stone-100">
                            <Shield className="size-8 text-amber-600" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                            Đặt lại mật khẩu
                        </h2>
                        <p className="mt-3 text-sm text-stone-500 font-medium tracking-wide">
                            Nhập mật khẩu mới cho tài khoản của bạn.
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="size-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
                                Đổi mật khẩu thành công!
                            </h3>
                            <p className="text-stone-500 text-sm">
                                Đang chuyển hướng về trang chính...
                            </p>
                        </motion.div>
                    ) : (
                        <form
                            className="space-y-5 relative z-10"
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-4">
                                <div className="relative">
                                    <label
                                        htmlFor="new-password"
                                        className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                                    >
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative flex items-center group">
                                        <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            id="new-password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
                                            placeholder="Nhập mật khẩu mới"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label
                                        htmlFor="confirm-new-password"
                                        className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                                    >
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative flex items-center group">
                                        <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            id="confirm-new-password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-700 text-[13px] text-center bg-red-50 p-3 rounded-xl border border-red-100/50 font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-[15px] font-bold rounded-xl text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 disabled:cursor-wait transition-all duration-300 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2.5">
                                            <svg
                                                className="animate-spin -ml-1 h-4 w-4 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        "Đặt lại mật khẩu"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>

            <Link
                href="/login"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-5 py-2.5 rounded-full shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Đăng nhập
            </Link>

            <Footer className="bg-transparent relative z-10 border-none mt-auto" />
        </div>
    );
}
