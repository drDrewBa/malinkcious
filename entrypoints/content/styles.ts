export const sharedStyles = `
  .box {
    width: 360px;
    background: black;
    color: white;
    font-size: 14px;
    font-family: sans-serif;
    border: 1px solid white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    padding: 2px 0 0 0;
  }

  .check {
    width: 16px;
    height: 16px;
    color: springgreen;
  }

  .warning {
    width: 16px;
    height: 16px;
    color: orange;
  }

  .danger {
    width: 16px;
    height: 16px;
    color: crimson;
  }

  .x {
    width: 16px;
    height: 16px;
    color: crimson;
  }

  .loader {
    width: 16px;
    height: 16px;
    color: #3498db;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .content {
    padding: 12px;
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  .classification {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 2px
  }

  .title {
    font-size: 14px;
    margin: 0;
  }

  .description {
    font-size: 12px;
    margin: 0;
    opacity: 0.8;
  }
`; 