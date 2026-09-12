/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../../types';

export const VIETNAMESE_QUOTES: Quote[] = [
  {
    text: "Sự tập trung là cốt lõi của ý thức. Làm ít hơn, nhưng làm tốt hơn.",
    author: "FocusFlow"
  },
  {
    text: "Ý thức về hiện tại chính là chìa khóa mở cánh cửa đến bình yên và hiệu suất.",
    author: "Thích Nhất Hạnh"
  },
  {
    text: "Mọi việc lớn trên đời đều bắt đầu từ những hành động nhỏ bé nhưng bền bỉ.",
    author: "Lão Tử"
  },
  {
    text: "Không phải chúng ta thiếu thời gian, mà chúng ta tiêu tốn quá nhiều thời gian vào nhiễu loạn.",
    author: "Seneca"
  },
  {
    text: "Trong một thế giới đầy náo nhiệt, sự tĩnh lặng chính là sức mạnh tối thượng.",
    author: "Khuyết danh"
  },
  {
    text: "Đơn giản hóa là bước đi tối thượng dẫn tới tinh tế.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Hãy dành tâm trí của bạn hoàn toàn cho những gì bạn đang thực hiện ngay lúc này.",
    author: "Marcus Aurelius"
  },
  {
    text: "Sự tập trung thực sự không phải là nói Có với việc bạn làm, mà là nói Không với hàng trăm việc khác.",
    author: "Steve Jobs"
  },
  {
    text: "Bạn luôn có quyền kiểm soát suy nghĩ và hành động của bản thân, không phải ngoại cảnh.",
    author: "Epictetus"
  },
  {
    text: "Bình yên đến từ bên trong. Đừng tìm kiếm nó bên ngoài.",
    author: "Đức Phật"
  }
];

export const ENGLISH_QUOTES: Quote[] = [
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Clare Boothe Luce"
  },
  {
    text: "Rule your mind or it will rule you.",
    author: "Horace"
  },
  {
    text: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack"
  },
  {
    text: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee"
  },
  {
    text: "Besides the noble art of getting things done, there is a noble art of leaving things undone.",
    author: "Lin Yutang"
  },
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell"
  },
  {
    text: "The key to productivity is to rotate your mind to a single task until it is completed.",
    author: "Deep Mind"
  },
  {
    text: "Quiet minds cannot be perplexed or frightened but go on in fortune or misfortune at their own private pace.",
    author: "Robert Louis Stevenson"
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha"
  }
];

export function getRandomQuoteByLanguage(lang: 'en' | 'vi'): Quote {
  const list = lang === 'en' ? ENGLISH_QUOTES : VIETNAMESE_QUOTES;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

// Keep the old export for backward compatibility or simple default
export function getRandomQuote(): Quote {
  return getRandomQuoteByLanguage('vi');
}
