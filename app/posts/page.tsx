// app/posts/page.tsx
'use client'

import { useState, useEffect } from 'react'

type Post = { id: number; title: string; content: string; createdAt: string }

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const newPost = await res.json()
    setPosts([...posts, newPost])
    setTitle('')
  }

  async function handleDelete(id: number) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New post title" />
        <button type="submit">Add Post</button>
      </form>
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            {p.title}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}