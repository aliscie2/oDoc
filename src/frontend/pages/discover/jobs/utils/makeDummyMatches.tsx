const DummyMatches = (matchingJobs) => {
  return matchingJobs.map((job: any) => ({
    job_id: job.id,
    score: 6,
    missmatching_skills: [],
    date_updated: 0,
    is_connected: false,
    user_id: "",
  }));
};
export default DummyMatches;
