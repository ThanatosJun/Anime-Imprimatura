from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# 設置 SQLAlchemy 的連接字串，這裡以 SQLite 為例
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:password@localhost/team18'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False# 創建 SQLAlchemy 的實例
db = SQLAlchemy(app)

# 定義一個模型，代表資料庫中的一個表
class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    gmail = db.Column(db.String(45), unique=True, nullable=False)
    password = db.Column(db.String(45), nullable=False)
    personal_gallery = db.Column(db.LargeBinary)

    def __repr__(self):
        return '<User %r>' % self.gmail

class Team(db.Model):
    __tablename__ = 'team'
    team_id = db.Column(db.Integer, primary_key=True)
    team_name = db.Column(db.String(45), unique=True, nullable=False)

class TeamUser(db.Model):
    __tablename__ = 'team_user'
    team_id = db.Column(db.Integer, db.ForeignKey('team.team_id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), primary_key=True)

class Image(db.Model):
    __tablename__ = 'image'
    chs_id = db.Column(db.Integer, primary_key=True)
    chd_id = db.Column(db.Integer, primary_key=True)
    upload_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    character = db.Column(db.String(45))

class DownloadableContent(db.Model):
    __tablename__ = 'downloadable_content'
    downloadable_content_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))

class CHD(db.Model):
    __tablename__ = 'CHD'
    chd_id = db.Column(db.Integer, db.ForeignKey('image.chd_id'), primary_key=True)
    file_route = db.Column(db.String(260), unique=True)

class CHS(db.Model):
    __tablename__ = 'CHS'
    chs_id = db.Column(db.Integer, db.ForeignKey('image.chs_id'), primary_key=True)
    file_route = db.Column(db.String(260), unique=True)

class ColoredCHD(db.Model):
    __tablename__ = 'coloredchd'
    idcoloredchd_id = db.Column(db.Integer, primary_key=True)
    file_route = db.Column(db.String(260), unique=True, nullable=False)
    download_size = db.Column(db.Integer, nullable=False)
    downloadable_content_id = db.Column(db.Integer, db.ForeignKey('downloadable_content.downloadable_content_id'))

class ColoringVideo(db.Model):
    __tablename__ = 'coloring_video'
    idcoloring_video_id = db.Column(db.Integer, primary_key=True)
    file_route = db.Column(db.String(260), unique=True, nullable=False)
    downloadable_content_id = db.Column(db.Integer, db.ForeignKey('downloadable_content.downloadable_content_id'))

class SharedContent(db.Model):
    __tablename__ = 'shared_content'
    idshared_content_id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.team_id'))

class SharedContentImage(db.Model):
    __tablename__ = 'shared_content_image'
    idshared_content_image_id = db.Column(db.Integer, primary_key=True)
    file_route = db.Column(db.String(260), unique=True, nullable=False)
    shared_content_id = db.Column(db.Integer, db.ForeignKey('shared_content.idshared_content_id'))

class SharedContentVideo(db.Model):
    __tablename__ = 'shared_content_video'
    idshared_content_video_id = db.Column(db.Integer, primary_key=True)
    file_route = db.Column(db.String(260), unique=True, nullable=False)
    shared_content_id = db.Column(db.Integer, db.ForeignKey('shared_content.idshared_content_id'))

# 創建資料庫表格
db.create_all()

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/add_user', methods=['POST'])
def add_user():
    new_user = User(gmail=request.form['gmail'], password=request.form['password'])
    db.session.add(new_user)
    db.session.commit()
    return 'User added!'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')