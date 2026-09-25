// 1. Tiêm "Giả dược" (Polyfill Chrome API) siêu cấp bằng Proxy
const mockEvent = {
  addListener: () => {},
  removeListener: () => {},
  hasListener: () => false,
};

// Hàm tạo Proxy: Tự động trả về mockEvent cho bất kỳ thuộc tính nào bắt đầu bằng chữ 'on'
// và trả về hàm rỗng cho bất kỳ method lạ nào. Chấp mọi loại API của trình duyệt!
const createMockApi = (base: any) => new Proxy(base, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop === 'string' && prop.startsWith('on')) return mockEvent;
    return async () => ({});
  }
});

(window as any).chrome = {
  runtime: createMockApi({
    id: 'riikon-center-mock',
    getManifest: () => ({ version: '0.4.0' }),
    getURL: (path: string) => {
      if (path.includes('site.html')) return "http://localhost:3304/?page=site";
      return "http://localhost:3304" + path;
    },
    sendMessage: async (msg: any) => {
      if (msg && msg.type === "site:open") {
        const route = msg.route || '/';
        const targetPath = `/apps/konnns-extension?path=${encodeURIComponent(route.startsWith('#') ? route : '#' + route)}`;
        window.parent.postMessage({ type: 'NAVIGATE', path: targetPath }, '*');
      }
      return {};
    }
  }),
  tabs: createMockApi({
    query: async () => [],
    create: async ({ url }: { url: string }) => {
      // Dùng postMessage để gửi lệnh điều hướng lên cho RiikonCenter (Next.js) thay vì sửa window.parent trực tiếp (bị chặn CORS do khác cổng)
      const hash = new URL(url).hash || '#/'; 
      const targetPath = `/apps/konnns-extension?path=${encodeURIComponent(hash)}`;
      window.parent.postMessage({ type: 'NAVIGATE', path: targetPath }, '*');
      return {};
    }
  }),
  storage: createMockApi({
    local: createMockApi({}),
    sync: createMockApi({}),
  }),
  scripting: createMockApi({}),
};

// Đảm bảo WXT/Browser API cũng nhận được mock
(window as any).browser = (window as any).chrome;

// 2. Tiêm "Kháng sinh" (Bẻ lái Fetch API) để lách luật CORS của Wallhaven
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  if (url.startsWith('https://wallhaven.cc/api')) {
    url = url.replace('https://wallhaven.cc/api', '/wallhaven-api');
    if (typeof input === 'string') {
      input = url;
    } else if (input instanceof Request) {
      input = new Request(url, init);
    }
  } else if (url.startsWith('https://w.wallhaven.cc')) {
    // Chuyển hướng cho cả domain lấy ảnh của Wallhaven
    url = url.replace('https://w.wallhaven.cc', '/wallhaven-img');
    if (typeof input === 'string') {
      input = url;
    } else if (input instanceof Request) {
      input = new Request(url, init);
    }
  }
  return originalFetch(input, init);
};

// 3. Tự chế "Router" siêu nhỏ gọn để Web bọc được nhiều App cùng lúc!
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('page');

if (page === 'popup') {
  // Ép buộc chế độ tối (dark mode) để tránh bị lóe sáng trắng
  document.documentElement.classList.add('dark');
  document.documentElement.style.setProperty('background', 'transparent', 'important');
  document.body.style.setProperty('background', 'transparent', 'important');

  // Tiêm CSS để biến cái Popup thành một thẻ Card bo góc nổi lềnh bềnh, cắt phần thừa
  const style = document.createElement('style');
  style.innerHTML = `
    html, body {
      background-color: transparent !important;
      color-scheme: dark;
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-end; /* Đẩy menu xuống dưới cùng, gần nút bấm */
      align-items: flex-start;
    }
    #root {
      background-color: #0f172a; /* Màu nền gốc của popup */
      border-radius: 16px !important; /* Bo góc mạnh hơn */
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: fit-content;
      height: fit-content;
      overflow: hidden;
      margin: 20px; /* Tạo khoảng trống để không bị cắt mất bóng (shadow) */
    }
  `;
  document.head.appendChild(style);

  // Trả về đúng cái cục Menu Tools & Apps nếu URL có ?page=popup
  import("@/entrypoints/popup/main.tsx");
} else if (page === 'site') {
  // Trả về giao diện các công cụ (Whiteboard, Audio Editor...)
  import("@/entrypoints/site/main.tsx");
} else {
  // Trả về cái giao diện Gốc (New Tab) nếu không truyền gì
  import("@/entrypoints/newtab/main.tsx");
}



