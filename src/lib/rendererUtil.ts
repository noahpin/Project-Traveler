export function getPostData(postBlockData: any[], id: string) {
    return postBlockData.find(post => post.id === id)?.posts || [];
}