import { useEffect, useState } from "react";

import {
  unstable_HistoryRouter as HistoryRouter,
  Routes,
  Route, useParams,
} from "react-router-dom";
import { view } from "@transformd-ltd/sandbox-bridge";
import PropTypes from "prop-types";
import NotFound from "./components/NotFound";
import "./App.css";
import HomePage from "./pages/Homepage";
import FormEmbedPage from "./pages/FormEmbedPage";

function TestPage() {
  const params = useParams();
  return (
    <div>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
}

function App(props) {
  const { history } = props;

  function handleComplete() {
    view.callBridge("reload");
  }

  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route index path="/form" element={<TestPage {...props} onComplete={handleComplete} />} />
        <Route index path="/form/:channel/:submissionId" element={<FormEmbedPage {...props} onComplete={handleComplete} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HistoryRouter>
  );
}

App.propTypes = {
  pat: PropTypes.string,
  apiUrl: PropTypes.string,
  sdkApiUrl: PropTypes.string,
  subscriptionApiUrl: PropTypes.string,
};
App.defaultProps = {
  pat: null,
  apiUrl: "https://api.transformd.com",
  sdkApiUrl: "https://api.transformd.com/graphql",
  subscriptionApiUrl: "https://api.transformd.com/subscriptions",
};

export default App;
