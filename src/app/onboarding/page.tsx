import { Suspense } from "react";
import { redirect } from "next/navigation";
import { chooseRole, getProfile } from "@/server/profile";

async function pickRole(formData: FormData) {
  "use server";
  await chooseRole({ role: formData.get("role") });
  redirect("/account");
}

async function RolePicker() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role) redirect("/account");

  return (
    <form action={pickRole} className="card flex flex-col items-center gap-4 p-10">
      <h1 className="page-title">Bạn là ai?</h1>
      <p className="text-sm text-zinc-600">Lựa chọn này không đổi lại được.</p>
      <div className="flex gap-4">
        <button name="role" value="student" className="btn px-8 py-3 text-lg">
          Học sinh
        </button>
        <button name="role" value="parent" className="btn px-8 py-3 text-lg">
          Phụ huynh
        </button>
      </div>
    </form>
  );
}

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <Suspense fallback={<p>Loading...</p>}>
        <RolePicker />
      </Suspense>
    </main>
  );
}
