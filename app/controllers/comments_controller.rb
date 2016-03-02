class CommentsController < ApplicationController
    before_filter :authenticate_user!, only: [:create, :upvote]


    def show
        respond_with Comment.find(params[:id])
    end

    def delcomment
        pid = Comment.find(params[:cid])['post_id']
        if (Post.where(:id => pid, :user_id => current_user.id).length > 0)
            Comment.find(params[:cid]).destroy
            redirect_to :back
        end
    end


    def addsolution
        usname = current_user.username
        pid = Comment.find(params[:ccid]).post_id
        oid = (Post.where(:id => pid)[0]).user_id
        own = User.find(oid)

        so = Solution.new
        so.update_attributes(:comment_id => params[:ccid])
        so.update_attributes(:user_id => current_user.id)
        so.update_attributes(:body => params[:body])
        so.update_attributes(:username => usname)
        so.save!
        if(oid != current_user.id)
            tit = Post.find(pid).title
            mms = 'You have got Unseen replies on, ' + tit;
            Msg.new(:user_id => oid, :seen => 0, :body => mms).save
        end
        redirect_to :back
    end



    def create
        p = Post.where(:id => params[:post_id], :user_id => current_user.id)
        if ((Member.where(:user_id => current_user.id, :post_id => params[:post_id]).length > 0 ) or (p.length > 0) )
            if (p.length <=0 )
                owner = Post.find(params[:post_id])
                mms = 'Someone posted a new Issue' + owner.title;
                Msg.new(:user_id => owner.user_id, :seen => 0, :body => mms).save
            end
            post = Post.find(params[:post_id])
            comment = post.comments.create(comment_params.merge(user_id: current_user.id))
            respond_with post,comment
        end
        #respond_with post, comment
    end

    def upvote
        post = Post.find(params[:post_id])
        comment = post.comments.find(params[:id])
        if comment
            if post
                if (Commentvote.where(:user_id => current_user.id, :comment_id => comment.id).length == 0)
                    comment.increment!(:upvotes)
                    c = Commentvote.new
                    c.update_attributes(:user_id => current_user.id)
                    c.update_attributes(:comment_id => comment.id)
                    c.save!
                    respond_with post, comment
                end
            end
        end
    end

    def angular
        render 'layouts/application'
    end

    private
    def comment_params
        params.require(:comment).permit(:body, :description, :upvotes)
    end
end
