import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loader from './Loader';

const CommentSection = ({ recipeId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${recipeId}`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.info('Please log in to leave a comment!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/comments', {
        recipeId,
        comment: newComment.trim(),
      });

      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setNewComment('');
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.delete(`/comments/${commentId}`);
      if (response.data.success) {
        setComments(comments.filter((c) => c.id !== commentId));
        toast.success('Comment deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  const getProfileImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  return (
    <div id="comments" style={styles.container}>
      <h3 style={styles.title}>
        <FaCommentDots style={{ color: 'var(--primary)', marginRight: '0.5rem' }} />
        Community Discussions ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} style={styles.form}>
          <img
            src={getProfileImage(user?.profile_image)}
            alt={user?.name}
            style={styles.formAvatar}
          />
          <div style={styles.inputWrapper}>
            <textarea
              rows="2"
              placeholder="Share your thoughts or variations on this recipe..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={styles.textarea}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn btn-primary"
              style={styles.submitBtn}
            >
              <FaPaperPlane /> Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div style={styles.loginPrompt}>
          Please <a href="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>log in</a> to participate in the conversation.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <Loader text="Loading comments..." />
      ) : comments.length === 0 ? (
        <div style={styles.emptyState}>
          Be the first chef to comment on this recipe!
        </div>
      ) : (
        <div style={styles.commentList}>
          {comments.map((item) => (
            <div key={item.id} style={styles.commentItem}>
              <img
                src={getProfileImage(item.user_image)}
                alt={item.user_name}
                style={styles.commentAvatar}
              />
              <div style={styles.commentContent}>
                <div style={styles.commentHeader}>
                  <span style={styles.commentUser}>{item.user_name}</span>
                  <span style={styles.commentDate}>
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p style={styles.commentText}>{item.comment}</p>
              </div>

              {user && user.id === item.user_id && (
                <button
                  onClick={() => handleDeleteComment(item.id)}
                  style={styles.deleteBtn}
                  title="Delete Comment"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  formAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '0.925rem',
    resize: 'vertical',
  },
  submitBtn: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.875rem',
  },
  loginPrompt: {
    padding: '1.25rem',
    background: 'var(--bg-input)',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'var(--text-muted)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  commentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  commentItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
  },
  commentAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  commentUser: {
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  commentDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  commentText: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: 'var(--text-main)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#e63946',
    cursor: 'pointer',
    opacity: 0.7,
    padding: '0.25rem',
  },
};

export default CommentSection;
