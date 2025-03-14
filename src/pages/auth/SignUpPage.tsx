import { AuthForm, Wrapper } from "../../components";

const SignUpPage = () => {
  return (
    <Wrapper>
      <AuthForm
        title="Create your account"
        subtitle="Let's get you started on your journey."
        googleText="Sign up with Google"
        buttonText="Sign Up"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
      />
    </Wrapper>
  );
};

export default SignUpPage;
