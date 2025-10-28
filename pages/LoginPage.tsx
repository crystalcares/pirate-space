import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/SignInForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <AuthLayout>
        <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome</h1>
            <p className="text-balance text-muted-foreground mt-2">
                Access your account and continue your journey with us.
            </p>
        </div>
        <SignInForm />
        <div className="mt-4 text-center text-sm">
            New to our platform?{" "}
            <Link to="/signup" className="underline text-primary hover:text-primary/80">
                Create Account
            </Link>
        </div>
    </AuthLayout>
  );
}
