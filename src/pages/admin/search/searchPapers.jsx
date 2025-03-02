import React, { useState } from 'react';
import { Button, Input, Card, Checkbox, Select } from 'antd';
import { BellOutlined, UserOutlined, SearchOutlined, EyeOutlined, DownloadOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

const SearchPapers = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const papers = [
    {
      id: 1,
      title: "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Nguyen Duy Thanh",
      department: "Khoa CNHH",
      views: 100,
      downloads: 27,
      date: "20/02/2025",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Nnlj5bM4FCTCRYRUly89H7FSMXaeF3.png",
    },
    {
      id: 2,
      title: "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      views: 100,
      downloads: 27,
      date: "20/02/2025",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Nnlj5bM4FCTCRYRUly89H7FSMXaeF3.png",
    },
    // Add more papers as needed
  ];

  const filteredPapers = papers.filter(paper => 
    paper.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Nnlj5bM4FCTCRYRUly89H7FSMXaeF3.png"
              alt="University Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-lg font-semibold text-gray-900 hidden md:block">
              HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by author"
                className="pl-10 w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button icon={<BellOutlined />} />
            <Button icon={<UserOutlined />} className="gap-2">
              <span className="text-blue-500">NGUYEN VAN A</span>
              <span className="text-gray-500">Admin</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <Button className="w-[153px] h-[46px] bg-[#00ace8] rounded-lg text-white text-xs font-medium">
              Tra cứu bài báo NCKH
            </Button>
            <Button className="w-[153px] h-[46px] bg-white rounded-lg text-[#7b7777] text-xs font-medium">
              Tra cứu tác giả
            </Button>
            <Button className="w-[153px] h-[46px] bg-white rounded-lg text-[#7b7777] text-xs font-medium">
              Tra cứu theo khoa
            </Button>
            <Button className="w-[153px] h-[46px] bg-white rounded-lg text-[#7b7777] text-xs font-medium">
              Tra cứu theo năm
            </Button>
            <Button className="w-[153px] h-[46px] bg-white rounded-lg text-[#7b7777] text-xs font-medium">
              Tra cứu theo nhóm
            </Button>
            <Button className="w-[153px] h-[46px] bg-white rounded-lg text-[#7b7777] text-xs font-medium">
              Tra cứu theo lĩnh vực
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-6">
            <Card title="Thể loại">
              <Checkbox.Group className="flex flex-col gap-3">
                <Checkbox value="all">Tất cả</Checkbox>
                <Checkbox value="author">Tác giả</Checkbox>
                <Checkbox value="year">Năm</Checkbox>
                <Checkbox value="group">Nhóm</Checkbox>
                <Checkbox value="department">Khoa</Checkbox>
                <Checkbox value="field">Lĩnh vực nghiên cứu</Checkbox>
              </Checkbox.Group>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-4">
            {filteredPapers.map((paper) => (
              <Card key={paper.id}>
                <div className="flex gap-4 p-6">
                  <div className="w-32 h-40 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                    <img
                      src={paper.image || "/placeholder.svg"}
                      alt={paper.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">{paper.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{paper.author}</p>
                    <p className="text-sm text-gray-500 mb-4">{paper.department}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EyeOutlined className="h-4 w-4" />
                        <span>{paper.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DownloadOutlined className="h-4 w-4" />
                        <span>{paper.downloads}</span>
                      </div>
                      <span>Ngày đăng: {paper.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex items-center justify-between pt-4">
              <Select defaultValue="200" className="w-[120px]">
                <Option value="50">50 rows</Option>
                <Option value="100">100 rows</Option>
                <Option value="200">200 rows</Option>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">1-2 of 250</span>
                <div className="flex gap-1">
                  <Button icon={<LeftOutlined />} />
                  <Button icon={<RightOutlined />} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPapers;
