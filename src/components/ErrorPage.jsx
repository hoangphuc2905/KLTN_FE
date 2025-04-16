import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  const status = "404";
  const title = "404";
  const subTitle = "Trang bạn tìm kiếm không tồn tại.";
  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Quay lại trang chủ
        </Button>
      }
    />
  );
};

export default ErrorPage;
