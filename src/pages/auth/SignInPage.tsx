import { AuthForm, Wrapper } from "../../components";

const SignInPage = () => {
  return (
    <Wrapper>
      <AuthForm
        title="Welcome back"
        subtitle="Let's continue your learning journey."
        googleText="Continue with Google"
        buttonText="Sign In"
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
      />
    </Wrapper>
  );
};

export default SignInPage;
