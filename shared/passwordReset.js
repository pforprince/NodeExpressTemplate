const resetEmailPasswordTemplate = (token) => {
  return `
<html>
  <body
    style="
      background-color: #113c55;
      color: white;
      font-family: sans-serif;
      text-align: center;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: auto;
        padding: 40px 20px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
          0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
          0 16px 16px rgba(0, 0, 0, 0.12);
      "
    >
      <img
        style="width: 140px"
        src="https://cotlox.com/static/media/logo_white.06e51b08bfa855d9fda1.png"
        alt=""
      />
      <h1 style="text-align: center">Reset Password</h1>
      <a
        href="https://cotlox.com/reset?token=${token}"
        style="text-decoration: none; cursor: pointer"
      >
        <button
          style="
            max-width: 600px;
            margin: auto;
            text-decoration: none;
            background-color: white;
            font-size: 16px;
            padding: 10px;
            border: none;
            outline: none;
            color: #113c55;
            padding: 8px 10px;
            width: 120px;
            border-radius: 4px;
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12),
              0 2px 2px rgba(0, 0, 0, 0.12), 0 4px 4px rgba(0, 0, 0, 0.12),
              0 8px 8px rgba(0, 0, 0, 0.12), 0 16px 16px rgba(0, 0, 0, 0.12);
          "
        >
          Reset
        </button>
      </a>
    </div>
  </body>
</html>

`;
};
module.exports = { resetEmailPasswordTemplate };
