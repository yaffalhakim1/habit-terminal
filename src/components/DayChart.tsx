interface Props {
  data: { day: string; rate: number }[];
}

export default function DayChart({ data }: Props) {
  return (
    <div className="daychart">
      {data.map(d => (
        <div key={d.day} className="daychart-row">
          <span className="daychart-label">{d.day}</span>
          <div className="daychart-bar-wrap">
            <div className="daychart-bar" style={{ width: `${d.rate}%` }} />
          </div>
          <span className="daychart-val">{d.rate}%</span>
        </div>
      ))}
    </div>
  );
}
