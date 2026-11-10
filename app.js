"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const box = { display: "block", width: "100%", padding: 10, margin: "8px 0", boxSizing: "border-box" };

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Account created. Now log in (confirm your email first if asked).");
  }

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "");
  }

  async function submitLink() {
    let platform = "other";
    try { platform = new URL(url).hostname.replace("www.", ""); } catch (e) {}
    const { error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, product_url: url, platform, notes });
    if (error) { setMsg(error.message); return; }
    setUrl(""); setNotes(""); setMsg("Request sent!");
    loadOrders();
  }

  if (!user) {
    return (
      <div>
        <h1>Nepal Store</h1>
        <p>Order from any Indian website, delivered to Nepal.</p>
        <input style={box} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={box} type="password" placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={box} onClick={logIn}>Log in</button>
        <button style={box} onClick={signUp}>Create account</button>
        <p>{msg}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Nepal Store</h1>
      <button onClick={() => supabase.auth.signOut()}>Log out</button>
      <h3>Paste a product link</h3>
      <input style={box} placeholder="https://www.amazon.in/..." value={url} onChange={(e) => setUrl(e.target.value)} />
      <input style={box} placeholder="Notes (size, color, quantity)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <button style={box} onClick={submitLink}>Send request</button>
      <p>{msg}</p>
      <h3>My orders</h3>
      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ccc", padding: 10, margin: "8px 0" }}>
          <div>{o.platform}</div>
          <div style={{ wordBreak: "break-all", fontSize: 12 }}>{o.product_url}</div>
          <b>Status: {o.status}</b>
          {o.quoted_price_npr && <div>Quote: NPR {o.quoted_price_npr}</div>}
        </div>
      ))}
    </div>
  );
           }
