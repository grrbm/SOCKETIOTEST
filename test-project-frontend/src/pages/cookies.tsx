import { Layout } from "@/components/Layout";
import { toast } from "react-toastify";
const Cookies = () => {
  const handleFetchCookie = () => {
    fetch("http://localhost:4000/set-cookie", {
      method: "POST",
      credentials: "include", // Include credentials (cookies)
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
      },
      body: JSON.stringify({ username: "Another Username" }),
    })
      .then((response) => response.text())
      .then((data) => {
        toast.success(data);
        console.log(data); // Logs the server's response (e.g., "Cookie has been set")
      })
      .catch((error) => {
        toast.error(error);
        console.error("Error:", error);
      });
  };
  return (
    <Layout>
      <div>Cookies page</div>
      <button
        className="text-black border h-10 w-[100px] mt-10"
        onClick={handleFetchCookie}
      >
        Fetch cookie
      </button>
    </Layout>
  );
};

export default Cookies;
