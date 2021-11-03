import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useRemoteStorage } from "../providers";
import { PostDetail } from "../components/index";

export default function PostDetailView() {
  const { id } = useParams();
  const remoteStorage = useRemoteStorage();
  const post = useMemo(async () => {
    const post = await remoteStorage.getPost(id);
    return post;
  }, []);

  return <PostDetail post={post} />;
}
