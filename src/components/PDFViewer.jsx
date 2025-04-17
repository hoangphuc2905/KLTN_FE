import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { throttle } from "lodash";

const PDFViewer = ({ fileUrl, onScroll, isModalVisible }) => {
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const hasTracked = useRef(false);
  const hasScrolledPast50 = useRef(false);
  const timeSpent = useRef(0);
  const timerRef = useRef(null);

  // Tải PDF
  useEffect(() => {
    console.log("🔍 useEffect tải PDF, fileUrl:", fileUrl);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    pdfjsLib
      .getDocument(fileUrl)
      .promise.then((pdfDoc) => {
        console.log("✅ PDF loaded successfully");
        setPdf(pdfDoc);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải PDF:", err);
        setError("Không thể tải file PDF. Vui lòng thử lại.");
      });

    return () => {
      console.log("🔄 Cleanup: Đóng PDF document");
      setPdf(null);
    };
  }, [fileUrl]);

  // Render các trang PDF
  useEffect(() => {
    if (pdf && containerRef.current) {
      console.log("🔍 Bắt đầu render PDF, numPages:", pdf.numPages);
      const renderPages = async () => {
        const container = containerRef.current;
        container.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = "mx-auto my-4 shadow-lg rounded-sm bg-white";
          container.appendChild(canvas);

          const context = canvas.getContext("2d");
          await page.render({ canvasContext: context, viewport }).promise;
        }
        console.log(`✅ Rendered ${pdf.numPages} pages`);
      };

      renderPages().catch((err) => {
        console.error("❌ Lỗi render PDF:", err);
        setError("Không thể hiển thị PDF. Vui lòng thử lại.");
      });
    }
  }, [pdf, scale]);

  // Theo dõi thời gian trong modal
  useEffect(() => {
    console.log("🔍 useEffect thời gian, isModalVisible:", isModalVisible);
    if (isModalVisible) {
      console.log("⏱️ Bắt đầu đếm thời gian");
      timeSpent.current = 0;
      hasTracked.current = false;
      hasScrolledPast50.current = false;
      timerRef.current = setInterval(() => {
        timeSpent.current += 1;
        console.log(
          `⏱️ Time spent: ${timeSpent.current}s, timerRef:`,
          timerRef.current
        );
        if (
          hasScrolledPast50.current &&
          timeSpent.current >= 30 &&
          !hasTracked.current
        ) {
          console.log("🚀 Gọi onScroll: Đã đủ 30s và cuộn qua 50%");
          onScroll(50);
          hasTracked.current = true;
        }
      }, 1000);
    }

    return () => {
      console.log("🔄 Dừng đếm thời gian, timerRef:", timerRef.current);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timeSpent.current = 0;
      hasTracked.current = false;
      hasScrolledPast50.current = false;
    };
  }, [isModalVisible]);

  // Xử lý sự kiện cuộn
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        console.log("📏 Scroll info:", {
          scrollTop,
          scrollHeight,
          clientHeight,
        });
        const scrolledPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100;
        console.log(`📜 PDF scrolled: ${scrolledPercentage.toFixed(2)}%`);
        console.log(
          "🔍 Kiểm tra hasTracked trong PDFViewer:",
          hasTracked.current
        );

        if (scrolledPercentage >= 50 && !hasScrolledPast50.current) {
          hasScrolledPast50.current = true;
          console.log(
            "✅ Đã cuộn qua 50%, thời gian hiện tại:",
            timeSpent.current
          );
          if (timeSpent.current >= 30 && !hasTracked.current) {
            console.log("🚀 Gọi onScroll: Đã đủ 30s khi cuộn qua 50%");
            onScroll(scrolledPercentage);
            hasTracked.current = true;
          } else {
            console.log("🚫 Chưa đủ 30s:", { timeSpent: timeSpent.current });
          }
        }
      }
    }, 500);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Xử lý PDF một trang
  useEffect(() => {
    if (pdf && pdf.numPages === 1 && !hasTracked.current && isModalVisible) {
      if (timeSpent.current >= 30) {
        console.log("📤 Gửi lượt xem PDF (1 trang) đến API");
        onScroll(100);
        hasTracked.current = true;
      }
    }
  }, [pdf, timeSpent.current, isModalVisible]);

  // Xử lý phóng to/thu nhỏ
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Chuyển trang
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      containerRef.current.scrollTo({
        top:
          (currentPage - 2) *
          (containerRef.current.scrollHeight / pdf.numPages),
        behavior: "smooth",
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pdf.numPages) {
      setCurrentPage((prev) => prev + 1);
      containerRef.current.scrollTo({
        top: currentPage * (containerRef.current.scrollHeight / pdf.numPages),
        behavior: "smooth",
      });
    }
  };

  // Log khi component unmount
  useEffect(() => {
    return () => {
      console.log("🔄 PDFViewer unmounted");
      if (timerRef.current) {
        console.log("🔄 Dừng timer khi unmount");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 font-semibold">{error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Thanh công cụ */}
      {pdf && (
        <div className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Trang trước
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === pdf.numPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Trang sau
            </button>
            <span className="text-gray-600 font-medium">
              Trang {currentPage} / {pdf?.numPages || 1}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Thu nhỏ
            </button>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Phóng to
            </button>
            <span className="text-gray-600 font-medium">
              {(scale * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Container PDF */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-100 scroll-smooth"
        style={{ height: "calc(90vh - 64px)" }}
      >
        {pdf ? (
          <div className="max-w-4xl mx-auto">
            {/* Các canvas sẽ được thêm vào đây bởi renderPages */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
