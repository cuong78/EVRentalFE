import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../hooks/useAuth";
import type { LoginFormData } from "../../../types/auth";
import { BsFacebook } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    onSwitchToForgotPassword?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
        },
    });
    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: LoginFormData) => {
        await login(data, onSuccess);
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
        <div className="max-w-md w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-4xl font-bold text-white">Login</h2>
                <p className="mt-2 text-center text-sm text-gray-300">Sign in to continue to your account</p>
            </div>
            <div className="mt-8 bg-black/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                            Username
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                type="text"
                                className="appearance-none block w-full px-3 py-2 border border-gray-600
                  rounded-lg bg-gray-900/50 text-gray-200 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your username"
                                autoComplete="username"
                                {...register("username", { required: "Username is required" })}
                            />
                            {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="appearance-none block w-full px-3 py-2 border border-gray-600
                  rounded-lg bg-gray-900/50 text-gray-200 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...register("password", { required: "Password is required" })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                            {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-900/50"
                                {...register("rememberMe")}
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-200">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a
                                onClick={onSwitchToForgotPassword}
                                className="font-medium text-purple-400 hover:text-purple-300">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg
                text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600
                hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-200
                hover:scale-[1.02]"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : "Login"}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black/70 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 ">
                        <button
                            onClick={handleGoogleLogin}
                            className="cursor-pointer w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-200">
                            <FcGoogle className="h-5 w-5" />
                        </button>
                        <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-200">
                            <BsFacebook className="h-5 w-5 text-blue-500" />

                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="font-medium text-purple-400 hover:text-purple-300"
                        >
                            Sign up now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
