import axios from "axios";

const Request = ({
  url,
  method,
  data,
  files,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  files?: any;
}) => {
  try {
    const config: any = { url, method, headers: {} };
    if (files) {
      config.headers["Content-Type"] = files[0]?.type;
      const formData = new FormData();
      
      
      formData.append("files", files);
      config.data = formData;
    } else if (data) config.data = data;

    return axios(config);
  } catch (err) {
    console.log(err);
  }
};

export default Request;
