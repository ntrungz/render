const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(async (req, res, next) => {
  let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);

  // Nếu đường dẫn bắt đầu với '/', thực hiện các bước chuyển hướng
  if (url.pathname.startsWith('/')) {
    url.hostname = "khoahoc.vietjack.com";

    try {
      // Lấy URL chuyển hướng
      const redirectUrl = await getRedirectUrl(url.href);

      if (redirectUrl) {
        // Chuyển hướng yêu cầu tới URL mới
        res.redirect(redirectUrl);
      } else {
        // Nếu không có chuyển hướng, tiếp tục với URL hiện tại
        const response = await fetch(url.href);
        const body = await response.text();
        res.send(body);
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Error fetching redirect URL: ' + error.message);
    }
  } else {
    next();
  }
});

// Hàm lấy URL chuyển hướng HTTP 302
async function getRedirectUrl(initialUrl) {
  try {
    // Gửi yêu cầu GET và không tự động theo dõi chuyển hướng
    const response = await fetch(initialUrl, {
      method: 'GET',
      redirect: 'manual' // Ngăn không cho tự động chuyển hướng
    });

    // Kiểm tra mã trạng thái HTTP 302 và lấy URL từ header Location
    if (response.status === 302) {
      return response.headers.get('Location');
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in getRedirectUrl:', error.message);
    throw new Error('Unable to fetch redirect URL');
  }
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
