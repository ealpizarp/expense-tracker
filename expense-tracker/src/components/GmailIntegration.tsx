import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { signOut } from "next-auth/react";
import {
  initializeGmailAPI,
  authenticateGmail,
  processEmailsFromSender,
  ParsedExpense,
} from "../utils/gmailIntegration";
import AICategorizationDisplay from "./AICategorizationDisplay";

interface GmailIntegrationProps {
  onExpensesImported?: (count: number) => void;
}

const GmailIntegration: React.FC<GmailIntegrationProps> = ({
  onExpensesImported,
}) => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [senderEmail, setSenderEmail] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rateLimitMode, setRateLimitMode] = useState<
    "conservative" | "normal" | "aggressive"
  >("normal");
  const [processingStatus, setProcessingStatus] = useState<{
    processed: number;
    stored: number;
    errors: number;
    deleted?: number;
    transactions?: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiCategorizedExpenses, setAiCategorizedExpenses] = useState<
    ParsedExpense[]
  >([]);

  // No need to load Gmail API script since we're using direct fetch calls

  const handleGmailAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First check if user is already signed in with NextAuth
      const sessionResponse = await fetch("/api/auth/session", {
        credentials: "include",
      });
      const session = await sessionResponse.json();

      if (session?.user) {
        setIsAuthenticated(true);
        return;
      }

      await initializeGmailAPI();

      await authenticateGmail();
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Gmail authentication failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to authenticate with Gmail. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessEmails = async () => {
    if (!senderEmail.trim()) {
      setError("Please enter a sender email address");
      return;
    }

    if (!user) {
      setError("Please sign in first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setProcessingStatus(null);

      const result = await processEmailsFromSender(
        senderEmail.trim(),
        user.id || "",
        selectedMonth,
        selectedYear,
        rateLimitMode
      );

      setProcessingStatus(result);

      if (onExpensesImported && result.stored > 0) {
        onExpensesImported(result.stored);
      }

      if (result.processed === 0) {
        setError(
          `No emails found from ${senderEmail} in ${selectedMonth}/${selectedYear}. Try a different month/year or check the sender email address.`
        );
      }
    } catch (error) {
      console.error("Error processing emails:", error);
      setError(
        `Failed to process emails: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestGmailSearch = async () => {
    if (!senderEmail.trim()) {
      setError("Please enter a sender email address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Test Gmail search without date filter first
      const accessToken = await getAccessToken();
      const testQuery = `from:${senderEmail}`;

      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
          testQuery
        )}&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          setError(
            `✅ Test successful! Found ${data.messages.length} emails from ${senderEmail}. Now try the month/year search.`
          );
        } else {
          setError(
            `❌ No emails found from ${senderEmail}. Check the sender email address.`
          );
        }
      } else {
        const errorText = await response.text();
        setError(`❌ Gmail API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setError(
        `Test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    const session = await response.json();

    if (!session?.accessToken) {
      throw new Error("No access token available. Please sign in again.");
    }

    return session.accessToken;
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setProcessingStatus(null);
  };

  useEffect(() => {
    // Check auth status on component mount
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const session = await response.json();
        const hasUser = !!session?.user;
        setIsAuthenticated(hasUser);
      } catch (error) {
        console.error("❌ Error checking session:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gmail Integration
        </h3>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Not Connected
            </span>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Gmail account to automatically import expense emails
            and parse them into your expense tracker.
          </p>

          <button
            onClick={handleGmailAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 8.545l6.545 4.549V3.821h3.819A1.636 1.636 0 0 1 24 5.457z"
                  />
                </svg>
                Connect Gmail
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Gmail is connected. Enter a sender email to import expenses.
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Disconnect
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="senderEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Sender Email Address
              </label>
              <input
                type="email"
                id="senderEmail"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g., noreply@bank.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="selectedMonth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Month
                </label>
                <select
                  id="selectedMonth"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="selectedYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <select
                  id="selectedYear"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Selected Period:</strong>{" "}
                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" }
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This will fetch all expense emails from the selected month and
                year.
              </p>
            </div>

            <div>
              <label
                htmlFor="rateLimitMode"
                className="block text-sm font-medium text-gray-700"
              >
                Rate Limit Mode
              </label>
              <select
                id="rateLimitMode"
                value={rateLimitMode}
                onChange={(e) => setRateLimitMode(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="conservative">
                  Conservative (Slower, More Reliable)
                </option>
                <option value="normal">Normal (Balanced)</option>
                <option value="aggressive">
                  Aggressive (Faster, May Hit Limits)
                </option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {rateLimitMode === "conservative" &&
                  "Processes 3 emails at a time with 2s delays (most reliable)"}
                {rateLimitMode === "normal" &&
                  "Processes 5 emails at a time with 1s delays (balanced)"}
                {rateLimitMode === "aggressive" &&
                  "Processes 10 emails at a time with 500ms delays (faster)"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="space-y-3">
                <button
                  onClick={handleTestGmailSearch}
                  disabled={isLoading || !senderEmail.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    "🧪 Test Gmail Search (No Date Filter)"
                  )}
                </button>

                <button
                  onClick={handleProcessEmails}
                  disabled={isLoading || !senderEmail.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Import Expenses from Gmail"
                  )}
                </button>
              </div>

              <button
                onClick={async () => {
                  if (!senderEmail.trim()) {
                    setError("Please enter a sender email address");
                    return;
                  }

                  setIsLoading(true);
                  setError(null);

                  try {
                    // Test Gmail search without date filters
                    const accessToken = await fetch("/api/auth/session", {
                      credentials: "include",
                    })
                      .then((r) => r.json())
                      .then((s) => s.accessToken);
                    const testQuery = `from:${senderEmail}`;
                    const response = await fetch(
                      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
                        testQuery
                      )}&maxResults=5`,
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    const data = await response.json();

                    if (data.messages && data.messages.length > 0) {
                      setError(
                        `Found ${data.messages.length} emails from ${senderEmail}. Check console for details.`
                      );
                    } else {
                      setError(
                        `No emails found from ${senderEmail}. Check the sender email address.`
                      );
                    }
                  } catch (error) {
                    setError(
                      `Test failed: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading || !senderEmail.trim()}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Test Gmail Search (Debug)
              </button>
            </div>
          </div>

          {processingStatus && (
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Processing Results
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Processed:</span>
                  <span className="ml-1 font-medium">
                    {processingStatus.processed}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Stored:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {processingStatus.stored}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Deleted:</span>
                  <span className="ml-1 font-medium text-orange-600">
                    {processingStatus.deleted || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Errors:</span>
                  <span className="ml-1 font-medium text-red-600">
                    {processingStatus.errors}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <h5 className="text-sm font-medium text-blue-900 mb-1">
                  🤖 AI Categorization
                </h5>
                <p className="text-xs text-blue-700">
                  All transactions are automatically categorized using Gemini AI
                  based on merchant names, amounts, and transaction patterns.
                  Check the console for detailed categorization results.
                </p>
              </div>

              {/* Display extracted transaction information */}
              {processingStatus.transactions &&
                processingStatus.transactions.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Extracted Transaction Information:
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 text-left">Commerce</th>
                            <th className="px-2 py-1 text-left">Date</th>
                            <th className="px-2 py-1 text-left">Amount</th>
                            <th className="px-2 py-1 text-left">Currency</th>
                            <th className="px-2 py-1 text-left">Category</th>
                            <th className="px-2 py-1 text-left">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processingStatus.transactions.map(
                            (transaction, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-200"
                              >
                                <td className="px-2 py-1">
                                  {transaction.Commerce}
                                </td>
                                <td className="px-2 py-1">
                                  {new Date(
                                    transaction.Date
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-1">
                                  {transaction.Amount}
                                </td>
                                <td className="px-2 py-1">
                                  {transaction.Currency}
                                </td>
                                <td className="px-2 py-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {transaction.Category || "Other"}
                                  </span>
                                </td>
                                <td className="px-2 py-1">
                                  {transaction.Location}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* AI Categorization Results */}
          {aiCategorizedExpenses.length > 0 && (
            <div className="mt-6">
              <AICategorizationDisplay expenses={aiCategorizedExpenses} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Error processing Gmail:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {error.includes("authentication") ||
                    error.includes("OAuth") ? (
                      <div className="mt-3">
                        <p className="font-medium">Try this:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Sign out and sign back in</li>
                          <li>
                            Make sure to grant Gmail permissions when prompted
                          </li>
                          <li>
                            Check that your Google account has Gmail access
                          </li>
                        </ol>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Sign Out & Try Again
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GmailIntegration;
