const StatCard = ({ label, value, tone }) => {
  const colors = { good: '#1a7f37', bad: '#cf222e', neutral: '#1f2328' };
  return (
    <div style={{ border: '1px solid #d0d7de', borderRadius: 8, padding: '16px 20px', minWidth: 160 }}>
      <div style={{ fontSize: 13, color: '#57606a' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: colors[tone] || colors.neutral }}>{value}</div>
    </div>
  );
};

export default StatCard;