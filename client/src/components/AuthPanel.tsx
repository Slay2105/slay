import { FormEvent, useState } from "react";
import { useAuthStore } from "../store/useAuth";

const AuthPanel = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });
  const { login, register, loading, error } = useAuthStore();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") {
      await login({ usernameOrEmail: form.username, password: form.password });
    } else {
      await register({ username: form.username, email: form.email, password: form.password });
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          Đăng ký
        </button>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Tên đăng nhập
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="HaleyCutie"
            required
          />
        </label>
        {mode === "register" && (
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ban@example.com"
              required
            />
          </label>
        )}
        <label>
          Mật khẩu
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••"
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : mode === "login" ? "Vào game" : "Tạo tài khoản"}
        </button>
      </form>
    </div>
  );
};

export default AuthPanel;
