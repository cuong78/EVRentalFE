import React, {useState} from "react";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import {FcGoogle} from "react-icons/fc";
import {BsFacebook} from "react-icons/bs";
import {useForm} from "react-hook-form";
import type {RegisterFormData, RegisterFormProps} from "../../../types/auth.ts";
import {useAuth} from "../../../hooks/useAuth.ts";

// simplified register form: only username, email, phone, password fields

export const RegisterForm: React.FC<RegisterFormProps> = ({onSwitchToLogin}) => {
    const {register: registerUser, isLoading} = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: {errors},
    } = useForm<RegisterFormData>({
        defaultValues: {
            username: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const password = watch("password");

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data, onSwitchToLogin);
        } catch (e: any) {
            // Hiển thị lỗi ngay dưới field dựa vào phản hồi server
            const serverMessage: string | undefined = e?.response?.data?.message || e?.message;
            const fieldErrors = e?.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === 'object') {
                Object.entries(fieldErrors).forEach(([key, val]) => {
                    const msg = Array.isArray(val) ? (val[0] as string) : (val as string);
                    if (key === 'username') setError('username', { message: msg });
                    if (key === 'email') setError('email', { message: msg });
                    if (key === 'phone' || key === 'phoneNumber') setError('phoneNumber', { message: msg });
                    if (key === 'password') setError('password', { message: msg });
                    if (key === 'confirmPassword') setError('confirmPassword', { message: msg });
                });
                return;
            }

            if (serverMessage) {
                const msg = serverMessage;
                if (/user(name)?/i.test(msg)) setError('username', { message: msg });
                else if (/email/i.test(msg)) setError('email', { message: msg });
                else if (/phone|số\s*điện\s*thoại|phoneNumber/i.test(msg)) setError('phoneNumber', { message: msg });
                else if (/password/i.test(msg)) setError('password', { message: msg });
                else setError('username', { message: msg });
            }
        }
    };

    const handleGoogleLogin = () => {
        const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;
        const authUri = "https://accounts.google.com/o/oauth2/v2/auth";
        const scope = encodeURIComponent("openid email profile");
        const responseType = "code";

        const authUrl = `${authUri}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

        window.location.href = authUrl;
    };


    return (
        <div className="max-w-7xl w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">Đăng Ký</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Tạo tài khoản để bắt đầu trải nghiệm
                </p>
            </div>

            <div className="mt-8 bg-white p-10 rounded-xl shadow-2xl">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Tên đăng nhập
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    {...register("username", {required: "Tên đăng nhập là bắt buộc"})}
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300
                    rounded-lg bg-white text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Nhập tên đăng nhập"
                                    autoComplete="username"
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>
                                )}
                            </div>
                        </div>

                    {/* Email Field */}
                    <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    {...register("email", {
                                        required: "Email là bắt buộc",
                                        pattern: {value: /\S+@\S+\.\S+/, message: "Email không hợp lệ"},
                                    })}
                                    type="email"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300
                    rounded-lg bg-white text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Nhập email"
                                    autoComplete="email"
                                />
                                {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                        </div>

                    {/* Phone Number Field */}
                    <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Số điện thoại
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phoneNumber"
                                    {...register("phoneNumber", {
                                        required: "Số điện thoại là bắt buộc",
                                        pattern: {
                                            value: /^0\d{9,}$/,
                                            message: "Số điện thoại phải bắt đầu bằng 0 và có ít nhất 10 chữ số",
                                        },
                                    })}
                                    type="tel"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300
                    rounded-lg bg-white text-gray-900 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Nhập số điện thoại"
                                    autoComplete="tel"
                                />
                                {errors.phoneNumber && (
                                    <p className="mt-2 text-sm text-red-500">{errors.phoneNumber.message}</p>
                                )}
                            </div>
                        </div>

                    {/* Password Field */}
                    <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <div className="mt-1">
                                <div className="relative">
                                    <input
                                        id="password"
                                        {...register("password", {
                                            required: "Mật khẩu là bắt buộc",
                                            minLength: {value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự"},
                                        })}
                                        type={showPassword ? "text" : "password"}
                                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300
                      rounded-lg bg-white text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                      pr-10 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                                        placeholder="Nhập mật khẩu"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-4 w-4" />
                                        ) : (
                                            <FaEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                    {/* Confirm Password Field */}
                    <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Xác nhận mật khẩu
                            </label>
                            <div className="mt-1">
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        {...register("confirmPassword", {
                                            required: "Vui lòng xác nhận mật khẩu",
                                            validate: (value) => value === password || "Mật khẩu không khớp",
                                        })}
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300
                      rounded-lg bg-white text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                      pr-10 transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                                        placeholder="Xác nhận mật khẩu"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-4 w-4" />
                                        ) : (
                                            <FaEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
                text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-600
                hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200
                hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : (
                                "Đăng Ký"
                            )}
                        </button>
                    </div>
                </form>

                {/* Social Login Section */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200">
                            <FcGoogle className="h-5 w-5" />
                        </button>
                        <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50">
                            <BsFacebook className="h-5 w-5 text-blue-500" />
                        </button>
                    </div>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-medium text-green-600 hover:text-blue-600"
                        >
                            Đăng nhập
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};