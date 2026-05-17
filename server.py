import os
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def pick_port():
    env_port = os.environ.get("WEB_PAGE_PORT")
    candidates = []
    if env_port:
        candidates.append(int(env_port))
    candidates.extend([8600, 8601, 8610])

    seen = set()
    for port in candidates:
        if port in seen:
            continue
        seen.add(port)
        probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            probe.bind(("127.0.0.1", port))
            return port
        except OSError:
            continue
        finally:
            probe.close()
    raise RuntimeError("No available web page port found.")


class StaticPageHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format_text, *args):
        return


def main():
    port = pick_port()
    server = ThreadingHTTPServer(("127.0.0.1", port), StaticPageHandler)
    print("Web page server: http://127.0.0.1:%s" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
