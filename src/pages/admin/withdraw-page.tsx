import { useState } from "react";
import { useFetchWithdrawalsQuery } from "../../api/admin";
import AdminWithdrawList from "../../features/admin/admin-withdraw-list";

function WithdrawPage() {
  const { data: withdrawals } = useFetchWithdrawalsQuery();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Separate withdrawals into pending and approved
  const pendingWithdrawals = withdrawals?.filter(w => !w.approvedBy && !w.approveDate) ?? [];
  const historyWithdrawals = withdrawals?.filter(w => w.approvedBy || w.approveDate) ?? [];
  const pendingCount = pendingWithdrawals.length;

  return (
    <div className="deposit-page-wrapper">
      {/* Pending notification */}
      {pendingCount > 0 && (
        <div className="create-button-container">
          <div className="pending-notification">
            <span className="notification-badge">{pendingCount}</span>
            <span>Хүлээгдэж буй татан авалт</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="deposit-tabs">
        <button 
          className={`deposit-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Хүлээгдэж буй ({pendingCount})
        </button>
        <button 
          className={`deposit-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Түүх ({historyWithdrawals.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "pending" ? (
        <AdminWithdrawList withdrawals={pendingWithdrawals} />
      ) : (
        <AdminWithdrawList withdrawals={historyWithdrawals} showHistory={true} />
      )}
    </div>
  );
}

export default WithdrawPage;
