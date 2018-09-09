import App, { Container } from "next/app";
import { Provider } from "react-redux";
import store from "../store";

export default class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}
