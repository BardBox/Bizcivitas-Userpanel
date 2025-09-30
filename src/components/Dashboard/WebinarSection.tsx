import PostCard from "./PostCard";

export default function WebinarSection() {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">Community Choice Webinar 2025</h2>
      <p className="mb-4 text-gray-600">
        What should we cover in our upcoming webinar? Cast your vote and discuss the webinar topic!
      </p>

      <h3 className="mb-2 font-semibold">Future of AI & Automation</h3>
      <ul className="space-y-4">
        <li>
          <span className="font-medium">Digital Marketing Trends</span>
        </li>
        <PostCard 
          title="Egestas libero nulla facili..." 
          content="Eget me ut a matri where rune heigatt ut vel leu us. Aliquam nihil."
        />
        <PostCard 
          title="Egestas libero nulla facili..." 
          content="Eget me ut a matri where rune heigatt ut vel leu us. Aliquam nihil."
        />
      </ul>
    </section>
  )
}