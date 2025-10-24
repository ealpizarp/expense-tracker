// Gmail API type declarations
declare namespace gapi {
  namespace client {
    namespace gmail {
      interface Gmail {
        users: {
          messages: {
            list: (params: {
              userId: string;
              q?: string;
              maxResults?: number;
            }) => Promise<{
              result: {
                messages?: Array<{ id: string }>;
              };
            }>;
            get: (params: {
              userId: string;
              id: string;
            }) => Promise<{
              result: any;
            }>;
          };
        };
      }
    }
  }

  function load(api: string, callback: () => void): void;
  const client: {
    init: (config: {
      apiKey: string;
      clientId: string;
      discoveryDocs: string[];
      scope: string;
    }) => Promise<void>;
    gmail: gapi.client.gmail.Gmail;
  };

  namespace auth2 {
    interface GoogleAuth {
      signIn: (options?: {
        scope?: string;
        prompt?: string;
      }) => Promise<GoogleAuth>;
    }
    
    interface Auth2 {
      init: (config: {
        client_id: string;
        scope: string;
      }) => Promise<void>;
      getAuthInstance: () => GoogleAuth | null;
    }
    
    function init(config: {
      client_id: string;
      scope: string;
      ux_mode?: string;
      fetch_basic_profile?: boolean;
    }): Promise<void>;
    function getAuthInstance(): GoogleAuth | null;
  }
}

declare global {
  interface Window {
    gapi: typeof gapi;
  }
}
