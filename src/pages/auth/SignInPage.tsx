import { AuthForm, Wrapper } from "../../components";
import { useAuth } from "../../hooks/useAuth";

const SignInPage = () => {
  const { isLoading } = useAuth();
  return (
    <Wrapper>
      <AuthForm
        title="Welcome back"
        subtitle="Let's continue your learning journey."
        googleText="Continue with Google"
        buttonText={isLoading ? "Signing In" : "Sign In"}
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
      />
    </Wrapper>
  );
};

export default SignInPage;
