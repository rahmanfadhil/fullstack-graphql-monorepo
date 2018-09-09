import "../static/style.scss";
import { connect } from "react-redux";
import { withRouter } from "next/router";

const HomePage = (state) => {
  console.log(state);
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
};

export default connect((state) => ({ state }))(withRouter(HomePage));
