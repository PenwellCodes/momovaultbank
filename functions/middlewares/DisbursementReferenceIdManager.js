let disbursementReferenceId = null;

function setDisbursementReferenceId(id) {
  disbursementReferenceId = id;
}

function getDisbursementReferenceId() {
  return disbursementReferenceId;
}

module.exports = {
  setDisbursementReferenceId,
  getDisbursementReferenceId,
};
