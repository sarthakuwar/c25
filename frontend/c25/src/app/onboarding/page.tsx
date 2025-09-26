import { OnboardingWizard } from "@/pages/onboarding/wizard";

export default function Home() {
  return (
     <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/bg.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <OnboardingWizard />
      </div>
  );
}
