import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LoginFormData } from "../../../types/auth";
import { BsFacebook } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../../hooks/useAuth";

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    onSwitchToForgotPassword?: () => void;
    stayOnPage?: boolean; // nếu true, không redirect sau login
}

<<<<<<< HEAD
export const LoginForm = ({ onSuccess, onSwitchToRegister, onSwitchToForgotPassword, stayOnPage }: LoginFormProps) => {
=======
export const LoginForm = ({ onSuccess, onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) => {
    const { login } = useAuth();
    
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
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
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onSubmit = async (data: LoginFormData) => {
<<<<<<< HEAD
        await login(data, onSuccess, { redirectTo: stayOnPage ? null : undefined });
=======
        setIsLoading(true);
        setErrorMsg(null);
        try {
            // Use the login method from useAuth
            await login(data, onSuccess);
            // Note: login method from useAuth already handles:
            // - Token storage
            // - Role detection
            // - Admin redirect
            // - Error display
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Login failed";
            setErrorMsg(errorMessage);
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
>>>>>>> e20d11b0eca0826dcfba530ffe0c81341434fe9e
    };

    const handleGoogleLogin = () => {
        const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;
        const authUri = "https://accounts.google.com/o/oauth2/v2/auth";
        const scope = encodeURIComponent("openid email profile");
        const responseType = "code";

        const authUrl = `${authUri}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

        globalThis.location.href = authUrl;
    };


    return (
        <div className="max-w-md w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-4xl font-bold text-gray-900">Login</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Sign in to continue to your account</p>
            </div>
            <div className="mt-8 bg-white p-8 rounded-xl shadow-2xl">
                {errorMsg && (
                    <div className="mb-4 text-center text-red-600 font-semibold">
                        {errorMsg}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="mt-1">
                            <input
                                id="username"
                                type="text"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300
                  rounded-lg bg-white text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter your username"
                                autoComplete="username"
                                {...register("username", { required: "Username is required" })}
                            />
                            {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300
                  rounded-lg bg-white text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...register("password", { required: "Password is required" })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
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
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded bg-white"
                                {...register("rememberMe")}
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={onSwitchToForgotPassword}
                                className="font-medium text-green-600 hover:text-blue-600">
                                Forgot your password?
                            </button>
                        </div>
                    </div>

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
                            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : "Login"}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 ">
                        <button
                            onClick={handleGoogleLogin}
                            className="cursor-pointer w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200">
                            <FcGoogle className="h-5 w-5" />
                        </button>
                        <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200">
                            <BsFacebook className="h-5 w-5 text-blue-500" />

                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="font-medium text-green-600 hover:text-blue-600"
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

