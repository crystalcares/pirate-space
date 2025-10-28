import AuthLayout from "@/components/auth/AuthLayout";
import SignUpForm from "@/components/auth/SignUpForm";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  return (
    <AuthLayout>
        <div className="text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-balance text-muted-foreground mt-2">
                Join the crew and start your trading journey today.
            </p>
        </div>
        <SignUpForm />
        <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary hover:text-primary/80">
                Sign In
            </Link>
        </div>
    </AuthLayout>
  );
}
