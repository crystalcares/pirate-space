import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthModal } from "@/contexts/AuthModalContext";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { PirateLogo } from "../ui/logo-icon";

export default function AuthModal() {
  const { isOpen, setIsOpen, initialTab, setInitialTab } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl">
        <DialogHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <PirateLogo className="w-12 h-12 text-primary" />
            </div>
          <DialogTitle>Join the Crew</DialogTitle>
          <DialogDescription>
            Sign in or create an account to start trading.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={initialTab} onValueChange={(value) => setInitialTab(value as 'signin' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
