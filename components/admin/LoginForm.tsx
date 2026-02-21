import { ArrowRight } from 'lucide-react';
import Input from '@/components/shared/custom/Input';
import FormButton from '@/components/shared/custom/FormButton';

const LoginForm = () => {
  return (
    <form className="space-y-3 md:space-y-4">
      {/* Email Address Input */}
      <Input
        label="Email Address"
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email address"
        required
      />

      {/* Password Input */}
      <Input
        label="Password"
        id="password"
        name="password"
        type="password"
        placeholder="Enter your password"
        required
      />

      {/* Submit Button */}
      <FormButton>
        <span>Sign In</span>
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </FormButton>
    </form>
  );
};

export default LoginForm;
