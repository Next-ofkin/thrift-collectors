"use client";
import { useState } from "react";
import { createAccount } from "../actions";

export default function CreateAccountForm() {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setMsg(null);
        const res = await createAccount(fd);
        if (res.error) setMsg(res.error);
        else setMsg(`Account created. Share this 6-digit code: ${res.account_code}`);
      }}
      className="flex gap-2 items-center"
    >
      <input className="input input-bordered flex-1" name="display_name" placeholder="e.g. Bola Daily Thrift" required />
      <button className="btn btn-primary">Create</button>
      {msg && <div className="text-sm opacity-80">{msg}</div>}
    </form>
  );
}
