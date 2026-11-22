import React, { useState } from "react";
import { APP_NAME, API_VERSION } from "../config/subsonic";
import { useToast } from "../hooks/useToast";
import { useLoginFlow } from "../hooks/useLoginFlow";
import LinerHero from "../components/login/LinerHero";
import LinerForm, { LoginFields } from "../components/login/LinerForm";
import SavedTracks from "../components/login/SavedTracks";
import AdvancedSettings from "../components/login/AdvancedSettings";
import SaveConnectionDialog from "../components/SaveConnectionDialog";
import Toast from "../components/Toast";

const EMPTY_FIELDS: LoginFields = { serverUrl: "", username: "", password: "" };
const FORM_ROW_COUNT = 3;

const LoginPage: React.FC = () => {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [appName, setAppName] = useState(APP_NAME);
  const [apiVersion, setApiVersion] = useState(API_VERSION);
  const { toast, showToast } = useToast();
  const flow = useLoginFlow(showToast);

  const submit = () => {
    const serverUrl = fields.serverUrl.trim();
    const username = fields.username.trim();
    if (!serverUrl || !username || !fields.password) {
      showToast("Please fill in all required fields");
      return;
    }
    void flow.connectNew({ serverUrl, username, password: fields.password, appName, apiVersion });
  };

  return (
    <div className="liner-page">
      <LinerHero />
      <main className="liner-sheet">
        <div className="liner-sheet-head">
          <h2>Sign in</h2>
          <p>Connect to your Subsonic server</p>
        </div>
        <LinerForm
          fields={fields}
          connecting={flow.connectingTo !== null}
          onChange={setFields}
          onSubmit={submit}
        />
        <SavedTracks
          connections={flow.connections}
          firstNumber={FORM_ROW_COUNT}
          connectingTo={flow.connectingTo}
          onPlay={flow.connectSaved}
          onRemove={flow.removeSaved}
        />
        <AdvancedSettings
          appName={appName}
          apiVersion={apiVersion}
          onAppNameChange={setAppName}
          onApiVersionChange={setApiVersion}
        />
      </main>

      {flow.showSaveDialog && (
        <SaveConnectionDialog
          title="Connection Successful"
          message="Save these credentials for future use?"
          cancelLabel="Skip"
          onSave={flow.saveCurrent}
          onCancel={flow.skipSave}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default LoginPage;
