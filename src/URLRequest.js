class URLRequest {
  constructor(url) {
    this.url = url || "";
    this.data = {};
    this.method = "GET";
    this.requestHeaders = {};
    this.contentType = "";
  }
}

module.exports = URLRequest;
