import { useNavigate } from "react-router-dom";
import { AuthForm, Wrapper } from "../../components";

const SignUpPage = () => {
  const navigate = useNavigate();
  const handleSignUp = (values: { email: string; password: string }) => {
    //TODO:save data to db
    console.log(values);
    //navigate to personal form
    navigate("/personal-form");
  };
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
        onSubmit={handleSignUp}
      />
    </Wrapper>
  );
};

export default SignUpPage;
